'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Stack, Loader, Alert, Title, Text, Group, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { vi, enUS } from 'date-fns/locale';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/lib/api/campaigns';
import { useRouter } from 'next/navigation';
import { IconRocket } from '@tabler/icons-react';

// Component imports
import CampaignStatsCards from './CampaignStatsCards';
import CampaignHeaderActions from './CampaignHeaderActions';
import CampaignTable from './CampaignTable';
import CampaignDeleteModal from './CampaignDeleteModal';

import LoadingSpinner from '@/components/ui/loading/loading-overlay';

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

// Enhanced page header component
const PageHeader = memo(({ title, description }: { title: string; description: string }) => (
  <Box
    style={{
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      borderRadius: 'var(--mantine-radius-lg)',
      padding: '32px',
      marginBottom: '24px',
      border: '1px solid var(--mantine-color-violet-1)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Background decoration */}
    <Box
      style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }}
    />

    <Group align="center" gap="lg" style={{ position: 'relative', zIndex: 1 }}>
      <Box
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
        }}
      >
        <IconRocket size={28} color="white" stroke={2} />
      </Box>

      <div style={{ flex: 1 }}>
        <Title
          order={1}
          size="h2"
          fw={800}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}
        >
          {title}
        </Title>
        <Text size="md" c="gray.6" fw={500}>
          {description}
        </Text>
      </div>
    </Group>
  </Box>
));
PageHeader.displayName = 'PageHeader';

// Memoized error component
const ErrorAlert = memo(({ error, onClear }: { error: string; onClear: () => void }) => (
  <Alert
    color="red"
    title="Lỗi"
    onClose={onClear}
    withCloseButton
    radius="md"
    styles={{
      root: {
        borderColor: 'var(--mantine-color-red-2)',
        backgroundColor: 'var(--mantine-color-red-0)'
      },
      title: { fontWeight: 700 },
      message: { color: 'var(--mantine-color-red-7)' }
    }}
  >
    {error}
  </Alert>
));

ErrorAlert.displayName = 'ErrorAlert';


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
    setPage
  } = useCampaigns();

  const router = useRouter();

  // State management
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'follow'>('all');

  // Memoize date locale to prevent unnecessary re-renders
  const dateLocale = useMemo(() => locale === 'vi' ? vi : enUS, [locale]);

  // Performance optimization: memoize filtered campaigns with stable reference
  const filteredCampaigns = useMemo(() => {
    if (activeTab === 'all') return campaigns;
    return campaigns.filter(campaign => campaign.campaign_type === activeTab);
  }, [campaigns, activeTab]);

  // Optimized tab change handler with debouncing
  const handleTabChange = useCallback((value: string) => {
    const newTab = value as 'all' | 'video' | 'follow';
    if (newTab === activeTab) return; // Prevent unnecessary calls

    setActiveTab(newTab);

    const newFilters = {
      ...filters,
      type: newTab === 'all' ? undefined : newTab,
      page: 1,
    };
    setFilters(newFilters);
    fetchCampaigns(newFilters);
  }, [activeTab, filters, setFilters, fetchCampaigns]);

  // Optimized status change handler with better error handling
  const handleStatusChange = useCallback(async (campaignId: string, newStatus: Campaign['status']) => {
    if (actionLoading === campaignId) return; // Prevent double-clicks

    try {
      setActionLoading(campaignId);
      await updateCampaign({ id: campaignId, status: newStatus });

      notifications.show({
        title: 'Thành công',
        message: `Chiến dịch đã ${newStatus === 'active' ? 'tiếp tục' : 'tạm dừng'} thành công`,
        color: 'green',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái chiến dịch',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, updateCampaign]);

  // Optimized delete handler
  const handleDeleteCampaign = useCallback(async () => {
    if (!deleteTarget || actionLoading === deleteTarget) return;

    try {
      setActionLoading(deleteTarget);
      await deleteCampaign(deleteTarget);

      closeDeleteModal();
      setDeleteTarget(null);

      notifications.show({
        title: 'Thành công',
        message: 'Chiến dịch đã được xóa thành công',
        color: 'green',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa chiến dịch',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  }, [deleteTarget, actionLoading, deleteCampaign, closeDeleteModal]);

  // Optimized delete click handler
  const handleDeleteClick = useCallback((campaignId: string) => {
    setDeleteTarget(campaignId);
    openDeleteModal();
  }, [openDeleteModal]);

  // Optimized create campaign handler
  const handleCreateCampaign = useCallback(() => {
    router.push(`/${locale}/campaigns/new`);
  }, [router, locale]);

  // Optimized refresh handler with loading state
  const handleRefresh = useCallback(() => {
    if (loading) return; // Prevent multiple refresh calls
    fetchCampaigns();
  }, [loading, fetchCampaigns]);

  // Optimized page change handler
  const handlePageChange = useCallback((page: number) => {
    if (page === pagination.page) return; // Prevent unnecessary calls
    setPage(page);
  }, [pagination.page, setPage]);

  // Loading state for initial load
  if (loading && campaigns.length === 0) {
    return <LoadingSpinner isVisible={loading} />;
  }

  return (
    <Stack gap="xl">
      {/* Page Header */}
      <PageHeader
        title={serverTranslations.title}
        description={serverTranslations.description}
      />

      {/* Stats Cards - Only render if stats exist */}
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
    </Stack>
  );
}