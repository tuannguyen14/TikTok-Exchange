// src/components/dashboard/DashboardStats.tsx
'use client';

import React from 'react';
import { Coins, Target, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStats {
  totalCredits: number;
  totalEarned: number;
  totalSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalActionsReceived: number;
}

interface DashboardStatsProps {
  stats: DashboardStats;
  t: (key: string) => string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: 'yellow' | 'blue' | 'green' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    yellow: 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
    blue: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
    green: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
    purple: 'from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-0 shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </h3>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardStats({ stats, t }: DashboardStatsProps) {
  const statsData = [
    {
      title: t('stats.totalCredits'),
      value: stats.totalCredits,
      icon: <Coins className="w-6 h-6 text-yellow-500" />,
      trend: `+${stats.totalEarned} ${t('stats.earned')}`,
      color: 'yellow' as const
    },
    {
      title: t('stats.activeCampaigns'),
      value: stats.activeCampaigns,
      icon: <Target className="w-6 h-6 text-blue-500" />,
      trend: `${stats.completedCampaigns} ${t('stats.completed')}`,
      color: 'blue' as const
    },
    {
      title: t('stats.totalActions'),
      value: stats.totalActionsReceived,
      icon: <Activity className="w-6 h-6 text-green-500" />,
      trend: t('stats.allTime'),
      color: 'green' as const
    },
    {
      title: t('stats.creditsSpent'),
      value: stats.totalSpent,
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      trend: t('stats.totalInvestment'),
      color: 'purple' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
        />
      ))}
    </div>
  );
}