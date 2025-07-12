// src/app/[locale]/videos/new/page.tsx (Server Component)
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import CreateCampaignClient from './CreateCampaignClient';
import CreateCampaignSkeleton from '@/components/campaigns/CreateCampaignSkeleton';

async function getCreateCampaignData() {
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

  // Get credit values reference
  const { data: creditValues, error: creditError } = await supabase
    .from('action_credit_values')
    .select('*');

  const formattedCreditValues = creditValues?.reduce((acc, item) => {
    acc[item.action_type] = item.credit_value;
    return acc;
  }, {} as Record<string, number>) || {
    view: 1,
    like: 2,
    comment: 3,
    follow: 5
  };

  return {
    profile,
    user,
    creditValues: formattedCreditValues
  };
}

export default async function CreateCampaignPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<CreateCampaignSkeleton />}>
      <CreateCampaignContent locale={locale} />
    </Suspense>
  );
}

async function CreateCampaignContent({ locale }: { locale: string }) {
  try {
    const data = await getCreateCampaignData();

    return (
      <CreateCampaignClient 
        locale={locale}
        profile={data.profile}
        creditValues={data.creditValues}
      />
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    redirect('/auth/login');
  }
}