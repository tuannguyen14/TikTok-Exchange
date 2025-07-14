// src/components/exchange/ExchangeStats.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Target, Coins, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ExchangeStats {
  activeCampaigns: number;
  totalCreditsAvailable: number;
  activeUsers: number;
}

interface ExchangeStatsProps {
  stats: ExchangeStats;
}

export default function ExchangeStats({ stats }: ExchangeStatsProps) {
  const t = useTranslations('Exchange');

  const statsData = [
    {
      title: t('stats.activeCampaigns'),
      value: stats.activeCampaigns,
      icon: Target,
      color: 'blue'
    },
    {
      title: t('stats.totalCreditsAvailable'),
      value: stats.totalCreditsAvailable,
      icon: Coins,
      color: 'yellow'
    },
    {
      title: t('stats.activeUsers'),
      value: stats.activeUsers,
      icon: Users,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      yellow: 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
      green: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 dark:text-blue-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      green: 'text-green-600 dark:text-green-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${getColorClasses(stat.color)} border-0 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <Icon className={`w-6 h-6 ${getIconColor(stat.color)}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

