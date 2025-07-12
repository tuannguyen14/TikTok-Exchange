// src/components/dashboard/DashboardSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Plus, 
  Users, 
  Clock, 
  Activity 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { campaignAPI } from '@/lib/api/campaigns';
import type { Profile } from '@/types/auth';

interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'action_received' | 'credits_earned';
  title: string;
  description: string;
  credits?: number;
  timestamp: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  profile: Profile;
  locale: string;
  t: (key: string) => string;
}

export default function DashboardSidebar({ profile, locale, t }: DashboardSidebarProps) {
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoadingActivity(true);
      try {
        const result = await campaignAPI.getUserCampaignStats();
        if (result.success && result.data?.recentActions) {
          const activities: RecentActivity[] = result.data.recentActions.map(action => ({
            id: action.id,
            type: 'action_received',
            title: t('activity.receivedAction').replace('{action}', action.action_type),
            description: t('activity.creditsEarned').replace('{credits}', action.credits_earned.toString()),
            credits: action.credits_earned,
            timestamp: action.created_at,
            icon: <Activity className="w-4 h-4 text-green-500" />
          }));
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, [t]);

  return (
    <>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#25F4EE]" />
            <span>{t('quickActions.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => router.push(`/${locale}/exchange`)}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {t('quickActions.startEarning')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => router.push(`/${locale}/videos/new`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('quickActions.createCampaign')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => router.push(`/${locale}/profile`)}
          >
            <Users className="w-4 h-4 mr-2" />
            {t('quickActions.viewProfile')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>{t('activity.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingActivity ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {activity.credits && (
                  <Badge variant="secondary" className="text-xs">
                    +{activity.credits}
                  </Badge>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('activity.noActivity')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}