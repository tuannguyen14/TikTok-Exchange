// src/app/[locale]/exchange/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import ExchangeClient from './ExchangeClient';
import ExchangeSkeleton from '@/components/exchange/ExchangeSkeleton';

async function getExchangeData() {
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

  // Check if TikTok is connected
  if (!profile.tiktok_username) {
    redirect('/profile?action=link-tiktok');
  }

  // Get active campaigns from other users
  const { data: campaigns, error: campaignsError } = await supabase
    .from('active_campaigns')
    .select(`
      *,
      videos!inner(title, description, category, video_url)
    `)
    .eq('status', 'active')
    .neq('user_id', user.id) // Don't show user's own campaigns
    .gt('remaining_credits', 0)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get exchange stats
  const { data: stats } = await supabase
    .from('active_campaigns')
    .select('id, remaining_credits')
    .eq('status', 'active')
    .neq('user_id', user.id)
    .gt('remaining_credits', 0);

  const exchangeStats = {
    activeCampaigns: campaigns?.length || 0,
    totalCreditsAvailable: stats?.reduce((sum, campaign) => sum + campaign.remaining_credits, 0) || 0,
    activeUsers: new Set(campaigns?.map(c => c.user_id)).size || 0
  };

  return {
    profile,
    user,
    campaigns: campaigns || [],
    stats: exchangeStats
  };
}

export default async function ExchangePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<ExchangeSkeleton />}>
      <ExchangeContent locale={locale} />
    </Suspense>
  );
}

async function ExchangeContent({ locale }: { locale: string }) {
  try {
    const data = await getExchangeData();

    return (
      <ExchangeClient 
        locale={locale}
        profile={data.profile}
        initialCampaigns={data.campaigns}
        stats={data.stats}
      />
    );
  } catch (error) {
    console.error('Exchange page error:', error);
    redirect('/auth/login');
  }
}