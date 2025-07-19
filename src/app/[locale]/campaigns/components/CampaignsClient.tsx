'use client';

import { useState, useCallback, useMemo } from 'react';
import { Stack, Loader, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { vi, enUS } from 'date-fns/locale';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/lib/api/campaigns';

// Component imports
import CampaignStatsCards from './CampaignStatsCards';
import CampaignHeaderActions from './CampaignHeaderActions';
import CampaignTable from './CampaignTable';
import CampaignDeleteModal from './CampaignDeleteModal';

interface ServerTranslations {
  title: string;
  description: string;
  stats: {
    total: string;
    active: string;
    completed: string;
    paused: string;
    creditsSpent: string;
    actionsReceived: string;
  };
  tabs: {
    all: string;
    video: string;
    follow: string;
  };
  table: {
    type: string;
    target: string;
    interaction: string;
    progress: string;
    creditsPerAction: string;
    status: string;
    created: string;
    actions: string;
  };
  status: {
    active: string;
    paused: string;
    completed: string;
    expired: string;
  };
  actions: {
    pause: string;
    resume: string;
    edit: string;
    delete: string;
    view: string;
  };
  buttons: {
    createCampaign: string;
    filter: string;
    refresh: string;
  };
  empty: {
    title: string;
    description: string;
    action: string;
  };
  deleteConfirm: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
  };
}

interface CampaignsClientProps {
  locale: string;
  serverTranslations: ServerTranslations;
}

export default function CampaignsClient({ locale, serverTranslations }: CampaignsClientProps) {
  const {
    campaigns,
    stats,
    loading,
    error,
    pagination,
    fetchCampaigns,
    updateCampaign,
    deleteCampaign,
    filters,
    setFilters,
    setPage,
  } = useCampaigns();

  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'follow'>('all');

  // Memoize date locale to prevent unnecessary re-renders
  const dateLocale = useMemo(() => locale === 'vi' ? vi : enUS, [locale]);

  // Performance optimization: memoize filtered campaigns
  const filteredCampaigns = useMemo(() => {
    if (activeTab === 'all') return campaigns;
    return campaigns.filter(campaign => campaign.campaign_type === activeTab);
  }, [campaigns, activeTab]);

  // Tab change handler with optimization
  const handleTabChange = useCallback((value: string) => {
    const newTab = value as 'all' | 'video' | 'follow';
    setActiveTab(newTab);
    
    const newFilters = {
      ...filters,
      type: newTab === 'all' ? undefined : newTab,
      page: 1,
    };
    setFilters(newFilters);
    fetchCampaigns(newFilters);
  }, [filters, setFilters, fetchCampaigns]);

  // Status change handler with optimistic updates
  const handleStatusChange = useCallback(async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      setActionLoading(campaignId);
      await updateCampaign({ id: campaignId, status: newStatus });
      notifications.show({
        title: 'Success',
        message: `Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update campaign status',
        color: 'red',
      });
    } finally {
      setActionLoading(null);
    }
  }, [updateCampaign]);

  // Delete handler with confirmation
  const handleDeleteCampaign = useCallback(async () => {
    if (!deleteTarget) return;
    
    try {
      setActionLoading(deleteTarget);
      await deleteCampaign(deleteTarget);
      closeDeleteModal();
      setDeleteTarget(null);
      notifications.show({
        title: 'Success',
        message: 'Campaign deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete campaign',
        color: 'red',
      });
    } finally {
      setActionLoading(null);
    }
  }, [deleteTarget, deleteCampaign, closeDeleteModal]);

  // Delete click handler
  const handleDeleteClick = useCallback((campaignId: string) => {
    setDeleteTarget(campaignId);
    openDeleteModal();
  }, [openDeleteModal]);

  // Create campaign handler
  const handleCreateCampaign = useCallback(() => {
    console.log('Create campaign clicked');
    // TODO: Navigate to create campaign page or open modal
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  // Loading state for initial load
  if (loading && campaigns.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: 400 }}>
        <Loader size="lg" />
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      {/* Stats Cards */}
      {stats && (
        <CampaignStatsCards 
          stats={stats} 
          translations={serverTranslations.stats} 
        />
      )}

      {/* Header Actions */}
      <CampaignHeaderActions
        activeTab={activeTab}
        loading={loading}
        onTabChange={handleTabChange}
        onRefresh={handleRefresh}
        onCreateCampaign={handleCreateCampaign}
        translations={{
          tabs: serverTranslations.tabs,
          buttons: serverTranslations.buttons
        }}
      />

      {/* Campaigns Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        locale={locale}
        actionLoading={actionLoading}
        pagination={pagination}
        translations={{
          table: serverTranslations.table,
          status: serverTranslations.status,
          empty: serverTranslations.empty
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteClick}
        onCreateCampaign={handleCreateCampaign}
        onPageChange={handlePageChange}
        dateLocale={dateLocale}
      />

      {/* Delete Confirmation Modal */}
      <CampaignDeleteModal
        opened={deleteModal}
        loading={actionLoading === deleteTarget}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCampaign}
        translations={serverTranslations.deleteConfirm}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          color="red"
          title="Error"
          onClose={() => {/* TODO: Clear error */}}
          withCloseButton
        >
          {error}
        </Alert>
      )}
    </Stack>
  );
}