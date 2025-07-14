// src/app/[locale]/campaigns/components/TikTokRequiredCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TikTokRequiredCardProps {
  locale: string;
}

export function TikTokRequiredCard({ locale }: TikTokRequiredCardProps) {
  const router = useRouter();
  const t = useTranslations('Campaigns');

  return (
    <Card className="max-w-md w-full">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('tiktokRequired.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('tiktokRequired.description')}
        </p>
        <Button 
          onClick={() => router.push(`/${locale}/profile?action=link-tiktok`)}
          className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
        >
          {t('tiktokRequired.connect')}
        </Button>
      </CardContent>
    </Card>
  );
}