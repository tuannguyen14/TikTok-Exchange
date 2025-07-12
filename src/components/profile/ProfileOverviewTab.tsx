// src/components/profile/ProfileOverviewTab.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Video,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProfileStats, TikTokStats } from '@/types/profile';
import type { Profile } from '@/types/auth';

interface ProfileOverviewTabProps {
  profile: Profile;
  profileStats: ProfileStats | null;
  tiktokStats: TikTokStats | null;
}

const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  profile,
  profileStats,
  tiktokStats
}) => {
  const t = useTranslations('Profile');

  const getCompletionRate = () => {
    if (!profileStats || profileStats.totalCampaigns === 0) return 0;
    return Math.round((profileStats.completedCampaigns / profileStats.totalCampaigns) * 100);
  };

  const quickStatsData = [
    {
      title: t('overview.campaigns'),
      value: profileStats?.totalCampaigns || 0,
      icon: Video,
      color: 'blue'
    },
    {
      title: t('overview.earned'),
      value: profileStats?.totalCreditsEarned || 0,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: t('overview.actions'),
      value: profileStats?.totalActionsPerformed || 0,
      icon: Activity,
      color: 'purple'
    },
    {
      title: t('overview.received'),
      value: profileStats?.totalActionsReceived || 0,
      icon: Heart,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStatsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${getColorClasses(stat.color)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Campaign Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.campaignProgress')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('overview.completionRate')}</span>
                <span>{getCompletionRate()}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('overview.active')}: </span>
                <span className="font-medium">{profileStats?.activeCampaigns || 0}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('overview.completed')}: </span>
                <span className="font-medium">{profileStats?.completedCampaigns || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileOverviewTab