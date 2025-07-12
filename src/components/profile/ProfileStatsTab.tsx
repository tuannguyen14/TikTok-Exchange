// src/components/profile/ProfileStatsTab.tsx
'use server';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Coins, 
  Activity, 
  Eye, 
  Heart, 
  MessageCircle, 
  UserPlus 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Profile } from '@/types/auth';
import type { ProfileStats } from '@/types/profile';

interface ProfileStatsTabProps {
  profile: Profile;
  profileStats: ProfileStats | null;
}

const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({
  profile,
  profileStats
}) => {
  const t = useTranslations('Profile');

  const getCompletionRate = () => {
    if (!profileStats || profileStats.totalCampaigns === 0) return 0;
    return Math.round((profileStats.completedCampaigns / profileStats.totalCampaigns) * 100);
  };

  const interactionTypes = [
    {
      title: t('stats.views'),
      icon: Eye,
      color: 'purple',
      credits: 1
    },
    {
      title: t('stats.likes'),
      icon: Heart,
      color: 'red',
      credits: 2
    },
    {
      title: t('stats.comments'),
      icon: MessageCircle,
      color: 'blue',
      credits: 3
    },
    {
      title: t('stats.follows'),
      icon: UserPlus,
      color: 'green',
      credits: 5
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span>{t('stats.creditsOverview')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.currentBalance')}
                </span>
                <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  <Coins className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">
                    {profile.credits || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.totalEarned')}
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{profileStats?.totalCreditsEarned || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.totalSpent')}
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -{profileStats?.totalCreditsSpent || 0}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('stats.netCredits')}
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {(profileStats?.totalCreditsEarned || 0) - (profileStats?.totalCreditsSpent || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>{t('stats.activityOverview')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.actionsPerformed')}
                </span>
                <span className="font-medium">
                  {profileStats?.totalActionsPerformed || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.actionsReceived')}
                </span>
                <span className="font-medium">
                  {profileStats?.totalActionsReceived || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.totalCampaigns')}
                </span>
                <span className="font-medium">
                  {profileStats?.totalCampaigns || 0}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('stats.successRate')}
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {getCompletionRate()}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stats.interactionBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {interactionTypes.map((interaction) => {
              const Icon = interaction.icon;
              return (
                <div
                  key={interaction.title}
                  className={`text-center p-4 rounded-lg border ${getColorClasses(interaction.color)}`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {interaction.title}
                  </p>
                  <p className="text-xl font-bold mb-1">-</p>
                  <p className="text-xs text-gray-500">
                    {t('stats.creditsEach', { count: interaction.credits })}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStatsTab;