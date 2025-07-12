// src/app/[locale]/dashboard/page.tsx (Server Component)
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import DashboardClient from './DashboardClient';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import TikTokLinkPrompt from '@/components/dashboard/TikTokLinkPrompt';

async function getDashboardData() {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  // If no TikTok username, show link prompt
  if (!profile.tiktok_username) {
    return { needsTikTokLink: true, profile, user };
  }

  // Get basic stats (fast queries)
  const [campaignsResult, statsResult] = await Promise.allSettled([
    // Get recent campaigns
    supabase
      .from('campaigns')
      .select(`
        id,
        video_title,
        interaction_type,
        target_count,
        current_count,
        remaining_credits,
        status,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),

    // Get campaign stats using view
    supabase
      .from('user_stats')
      .select('*')
      .eq('id', user.id)
      .single()
  ]);

  const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [];
  const userStats = statsResult.status === 'fulfilled' ? statsResult.value.data : null;

  return {
    needsTikTokLink: false,
    profile,
    user,
    initialData: {
      campaigns,
      stats: {
        totalCredits: profile.credits,
        totalEarned: profile.total_earned,
        totalSpent: profile.total_spent,
        activeCampaigns: userStats?.total_campaigns || 0,
        completedCampaigns: userStats?.total_campaigns || 0,
        totalActionsReceived: userStats?.total_actions || 0,
      }
    }
  };
}

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent locale={locale} />
    </Suspense>
  );
}

async function DashboardContent({ locale }: { locale: string }) {
  try {
    const data = await getDashboardData();

    if (data.needsTikTokLink) {
      return <TikTokLinkPrompt locale={locale} />;
    }

    return (
      <>
        {
          data.initialData ? <DashboardClient
            locale={locale}
            profile={data.profile}
            initialData={data.initialData}
          /> : null
        }
      </>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/auth/login');
  }
}