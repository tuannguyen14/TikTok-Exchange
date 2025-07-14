// src/app/[locale]/dashboard/DashboardClient.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCampaigns from '@/components/dashboard/DashboardCampaigns';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types/auth';
import OverlayLoading from "@/components/loading/OverlayLoading";

interface DashboardStats {
  totalCredits: number;
  totalEarned: number;
  totalSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalActionsReceived: number;
}

interface Campaign {
  id: string;
  video_title?: string;
  interaction_type: 'like' | 'comment' | 'follow' | 'view';
  target_count: number;
  current_count: number;
  remaining_credits: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

interface DashboardClientProps {
  locale: string;
  profile: Profile;
  campaigns: Campaign[];
  stats: DashboardStats;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  onCampaignStatusUpdate?: (campaignId: string, status: 'active' | 'paused') => Promise<boolean>;
}

export default function DashboardClient({
  locale,
  profile,
  campaigns,
  stats,
  refreshing = false,
  onRefresh,
  onCampaignStatusUpdate
}: DashboardClientProps) {
  const t = useTranslations('Dashboard');

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <OverlayLoading
          isVisible={refreshing}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex-1">
            <DashboardHeader
              profile={profile}
              locale={locale}
              t={t}
            />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="self-start md:self-auto flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DashboardStats
            stats={stats}
            t={t}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <DashboardCampaigns
              campaigns={campaigns}
              locale={locale}
              t={t}
              onCampaignStatusUpdate={onCampaignStatusUpdate}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <DashboardSidebar
              profile={profile}
              locale={locale}
              t={t}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}