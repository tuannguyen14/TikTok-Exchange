// src/app/[locale]/campaigns/components/CampaignsList.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Campaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { CampaignsEmptyState } from './CampaignsEmptyState';

interface CampaignsListProps {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  activeTab: string;
  searchTerm: string;
  loading: boolean;
  hasMore: boolean;
  locale: string;
  updatingCampaign: string | null;
  deletingCampaign: string | null;
  onTabChange: (value: string) => void;
  onStatusUpdate: (campaignId: string, status: 'active' | 'paused') => void;
  onDelete: (campaignId: string) => void;
  onCreateCampaign: () => void;
  onClearSearch: () => void;
  onLoadMore: () => void;
}

export function CampaignsList({
  campaigns,
  filteredCampaigns,
  activeTab,
  searchTerm,
  loading,
  hasMore,
  locale,
  updatingCampaign,
  deletingCampaign,
  onTabChange,
  onStatusUpdate,
  onDelete,
  onCreateCampaign,
  onClearSearch,
  onLoadMore,
}: CampaignsListProps) {
  const t = useTranslations('Campaigns');

  const getTabCount = (status: string) => {
    if (status === 'all') return filteredCampaigns.length;
    return filteredCampaigns.filter(c => c.status === status).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4 lg:w-96">
          <TabsTrigger value="all">
            {t('tabs.all')} ({getTabCount('all')})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t('tabs.active')} ({getTabCount('active')})
          </TabsTrigger>
          <TabsTrigger value="paused">
            {t('tabs.paused')} ({getTabCount('paused')})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('tabs.completed')} ({getTabCount('completed')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, index) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  locale={locale}
                  onStatusUpdate={onStatusUpdate}
                  onDelete={onDelete}
                  updatingCampaign={updatingCampaign}
                  deletingCampaign={deletingCampaign}
                />
              ))}
            </div>
          ) : (
            <CampaignsEmptyState 
              activeTab={activeTab}
              hasSearch={searchTerm.length > 0}
              locale={locale}
              onCreateCampaign={onCreateCampaign}
              onClearSearch={onClearSearch}
            />
          )}

          {/* Load More */}
          {hasMore && campaigns.length > 0 && (
            <div className="text-center">
              <Button
                onClick={onLoadMore}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('pagination.loading')}
                  </>
                ) : (
                  t('pagination.loadMore')
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}