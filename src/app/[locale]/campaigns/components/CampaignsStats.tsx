// src/app/[locale]/campaigns/components/CampaignsStats.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Coins, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CampaignStats } from '../types';

interface CampaignsStatsProps {
  stats: CampaignStats;
}

export function CampaignsStats({ stats }: CampaignsStatsProps) {
  const t = useTranslations('Campaigns');

  const statsCards = [
    {
      title: t('stats.totalCampaigns'),
      value: stats.totalCampaigns,
      subtitle: t('stats.active', { count: stats.activeCampaigns }),
      icon: Target,
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('stats.totalActions'),
      value: stats.totalActionsReceived,
      subtitle: t('stats.totalInteractions'),
      icon: TrendingUp,
      gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('stats.creditsSpent'),
      value: stats.totalCreditsSpent,
      subtitle: t('stats.totalInvestment'),
      icon: Coins,
      gradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: t('stats.completedCampaigns'),
      value: stats.completedCampaigns,
      subtitle: t('stats.successfulCampaigns'),
      icon: Clock,
      gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {statsCards.map((stat, index) => (
        <Card key={index} className={`bg-gradient-to-br ${stat.gradient} border-0`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}