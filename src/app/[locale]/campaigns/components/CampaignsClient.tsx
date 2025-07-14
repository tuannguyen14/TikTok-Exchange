// src/app/[locale]/campaigns/components/CampaignsClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuth } from '@/hooks/useAuth';
import { campaignAPI } from '@/lib/api/campaigns';
import OverlayLoading from '@/components/loading/OverlayLoading';

import { CampaignsHeader } from './CampaignsHeader';
import { CampaignsStats } from './CampaignsStats';
import { CampaignsFilters } from './CampaignsFilters';
import { CampaignsList } from './CampaignsList';
import { TikTokRequiredCard } from './TikTokRequiredCard';
import { Campaign, CampaignStats } from '../types';

interface CampaignsClientProps {
  locale: string;
}

export function CampaignsClient({ locale }: CampaignsClientProps) {
  const router = useRouter();
  const t = useTranslations('Campaigns');
  const { profile, isAuthenticated, loading: authLoading } = useAuth();

  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // Action states
  const [updatingCampaign, setUpdatingCampaign] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale}/auth/login`);
    }
  }, [authLoading, isAuthenticated, router, locale]);

  // Fetch campaigns
  const fetchCampaigns = async (isRefresh = false, newPage = 1) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (newPage === 1) {
        setLoading(true);
      }
      setError(null);

      const filters: any = {
        page: newPage,
        limit,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        filters.interaction_type = typeFilter;
      }

      const result = await campaignAPI.getUserCampaigns(filters);

      if (result.success && result.data) {
        if (newPage === 1) {
          setCampaigns(result.data.campaigns || []);
        } else {
          setCampaigns(prev => [...prev, ...(result.data.campaigns || [])]);
        }
        
        setHasMore(result.data.pagination?.hasMore || false);
        setPage(newPage);

        // Fetch stats if refreshing
        if (isRefresh || newPage === 1) {
          await fetchStats();
        }
      } else {
        setError(result.error || t('notifications.loadFailed'));
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
      setError(t('notifications.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const result = await campaignAPI.getUserCampaignStats();
      if (result.success && result.data) {
        setStats({
          totalCampaigns: result.data.overview.totalCampaigns,
          activeCampaigns: result.data.overview.activeCampaigns,
          completedCampaigns: result.data.overview.completedCampaigns,
          pausedCampaigns: result.data.overview.pausedCampaigns || 0,
          totalCreditsSpent: result.data.overview.totalCreditsSpent,
          totalActionsReceived: result.data.overview.totalActionsReceived,
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (profile && locale) {
      fetchCampaigns();
    }
  }, [profile, locale, statusFilter, typeFilter]);

  // Filter campaigns by search term
  const filteredCampaigns = campaigns.filter(campaign => {
    const video = campaign.videos?.[0];
    const title = video?.title?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return title.includes(searchLower);
  });

  // Filter by tab
  const getTabCampaigns = (tab: string) => {
    if (tab === 'all') return filteredCampaigns;
    if (tab === 'active') return filteredCampaigns.filter(c => c.status === 'active');
    if (tab === 'paused') return filteredCampaigns.filter(c => c.status === 'paused');
    if (tab === 'completed') return filteredCampaigns.filter(c => c.status === 'completed');
    return filteredCampaigns;
  };

  const displayCampaigns = getTabCampaigns(activeTab);

  // Action handlers
  const handleStatusUpdate = async (campaignId: string, newStatus: 'active' | 'paused') => {
    setUpdatingCampaign(campaignId);
    try {
      const result = await campaignAPI.updateCampaign(campaignId, newStatus);
      if (result.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        ));
        setSuccess(t('notifications.campaignUpdated', { status: newStatus }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || t('notifications.updateFailed'));
      }
    } catch (error) {
      setError(t('notifications.updateFailed'));
    } finally {
      setUpdatingCampaign(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm(t('notifications.deleteConfirm'))) {
      return;
    }

    setDeletingCampaign(campaignId);
    try {
      const result = await campaignAPI.deleteCampaign(campaignId);
      if (result.success) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
        setSuccess(t('notifications.campaignDeleted'));
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh stats
        await fetchStats();
      } else {
        setError(result.error || t('notifications.deleteFailed'));
      }
    } catch (error) {
      setError(t('notifications.deleteFailed'));
    } finally {
      setDeletingCampaign(null);
    }
  };

  const handleRefresh = () => {
    fetchCampaigns(true, 1);
  };

  const handleCreateCampaign = () => {
    router.push(`/${locale}/campaigns/new`);
  };

  const handleLoadMore = () => {
    fetchCampaigns(false, page + 1);
  };

  if (authLoading || !locale) {
    return <OverlayLoading isVisible={true} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!profile?.tiktok_username) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <TikTokRequiredCard locale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <OverlayLoading isVisible={loading && campaigns.length === 0} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <CampaignsHeader 
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onCreateCampaign={handleCreateCampaign}
        />

        {/* Stats */}
        {stats && (
          <CampaignsStats stats={stats} />
        )}

        {/* Filters */}
        <CampaignsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaigns List */}
        <CampaignsList
          campaigns={displayCampaigns}
          filteredCampaigns={filteredCampaigns}
          activeTab={activeTab}
          searchTerm={searchTerm}
          loading={loading}
          hasMore={hasMore}
          locale={locale}
          updatingCampaign={updatingCampaign}
          deletingCampaign={deletingCampaign}
          onTabChange={setActiveTab}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          onCreateCampaign={handleCreateCampaign}
          onClearSearch={() => setSearchTerm('')}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}