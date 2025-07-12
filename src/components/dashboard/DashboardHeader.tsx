// src/components/dashboard/DashboardHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTikTok } from '@/hooks/useTikTok';
import type { Profile } from '@/types/auth';

interface DashboardHeaderProps {
  profile: Profile;
  locale: string;
  t: (key: string) => string;
}

export default function DashboardHeader({ profile, locale, t }: DashboardHeaderProps) {
  const router = useRouter();
  const { fetchProfile } = useTikTok();
  const [tiktokAvatar, setTikTokAvatar] = useState<string | null>(null);

  // Fetch TikTok avatar
  useEffect(() => {
    if (profile?.tiktok_username) {
      fetchProfile(profile.tiktok_username).then(data => {
        if (data?.user?.avatarMedium) {
          setTikTokAvatar(data.user.avatarMedium);
        }
      });
    }
  }, [profile?.tiktok_username, fetchProfile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const getDisplayName = () => {
    return profile?.tiktok_username ? `@${profile.tiktok_username}` : profile?.email || 'User';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
          <AvatarImage src={tiktokAvatar || undefined} alt={getDisplayName()} />
          <AvatarFallback className="bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
            {getGreeting()}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('welcome')}, {getDisplayName()}. Ready to grow your TikTok?
          </p>
        </div>
      </div>
      
      <Button 
        onClick={() => router.push(`/${locale}/videos/new`)}
        className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('createCampaign')}
      </Button>
    </div>
  );
}