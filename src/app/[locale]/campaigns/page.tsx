// src/app/[locale]/campaigns/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CampaignsClient } from './components/CampaignsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'vi' ? 'Chiến dịch của tôi - TikGrow' : 'My Campaigns - TikGrow',
    description: locale === 'vi' 
      ? 'Quản lý các chiến dịch tăng trưởng TikTok của bạn'
      : 'Manage your TikTok growth campaigns'
  };
}

export default async function CampaignsPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return <CampaignsClient locale={locale} />;
}