// app/[locale]/exchange/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Container, Stack, Alert, Box, SegmentedControl, Group, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useExchangeCampaigns, useUserActions } from '@/hooks/useExchange';
import { useAuth } from '@/contexts/auth-context';
import CampaignCard from './components/CampaignCard';
import ExchangeEmptyState from './components/ExchangeEmptyState';
import LottieLoading from '@/components/ui/loading/loading-overlay';
import { Campaign } from '@/lib/api/exchange';

export default function ExchangePage() {
    const t = useTranslations('Exchange');
    const { profile, loading: authLoading } = useAuth();

    // Current campaign index
    const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
    // Campaign type filter
    const [campaignTypeFilter, setCampaignTypeFilter] = useState<'all' | 'like' | 'follow'>('all');

    // Fetch active campaigns only
    const {
        campaigns,
        loading: campaignLoading,
        error: campaignError,
        refetch: refetchCampaigns
    } = useExchangeCampaigns(undefined, 'active', 'newest');

    // Fetch user actions
    const {
        actions: userActions,
        loading: actionsLoading,
        error: actionsError,
        refetch: refetchActions
    } = useUserActions();

    // Filter campaigns by type and completion status
    const filteredCampaigns = campaigns?.filter(campaign => {
        // Filter by campaign type
        if (campaignTypeFilter === 'like' && campaign.interaction_type !== 'like') return false;
        if (campaignTypeFilter === 'follow' && campaign.campaign_type !== 'follow') return false;

        // Filter out completed campaigns
        const actionType = campaign.campaign_type === 'follow' ? 'follow' : campaign.interaction_type;
        return !userActions?.some(
            action => action.campaign_id === campaign.id && action.action_type === actionType
        );
    }) || [];

    // Get current campaign
    const currentCampaign = filteredCampaigns[currentCampaignIndex];

    // Handle skip to next campaign
    const handleSkipCampaign = () => {
        if (filteredCampaigns.length > 1) {
            setCurrentCampaignIndex(prev => (prev + 1) % filteredCampaigns.length);
        }
    };

    // Handle action complete - move to next campaign
    const handleActionComplete = () => {
        refetchCampaigns();
        refetchActions();

        // Move to next campaign after a short delay
        setTimeout(() => {
            if (filteredCampaigns.length > 1) {
                setCurrentCampaignIndex(prev => (prev + 1) % filteredCampaigns.length);
            }
        }, 1500);
    };

    // Reset index when campaigns or filter change
    useEffect(() => {
        setCurrentCampaignIndex(0);
    }, [campaignTypeFilter]);

    useEffect(() => {
        if (currentCampaignIndex >= filteredCampaigns.length) {
            setCurrentCampaignIndex(0);
        }
    }, [filteredCampaigns.length, currentCampaignIndex]);

    // Check if user needs to connect TikTok
    const needsTikTokConnection = !profile?.tiktok_username;

    const handleRefresh = () => {
        refetchCampaigns();
        refetchActions();
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                position: 'relative'
            }}
        >
            <Container
                size="sm"
                style={{
                    minHeight: '100vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem'
                }}
            >
                {/* Header with Title and Filter */}
                <Stack gap="md" mb="lg">
                    {/* Campaign Type Filter */}
                    <Group justify="center">
                        <SegmentedControl
                            value={campaignTypeFilter}
                            onChange={(value) => setCampaignTypeFilter(value as 'all' | 'like' | 'follow')}
                            data={[
                                { label: t('filters.all'), value: 'all' },
                                { label: t('filters.like'), value: 'like' },
                                { label: t('filters.follow'), value: 'follow' }
                            ]}
                            size="sm"
                            radius="xl"
                            styles={{
                                root: {
                                    backgroundColor: 'white',
                                    border: '1px solid #e9ecef',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                }
                            }}
                        />
                    </Group>
                </Stack>

                {/* TikTok Connection Alert */}
                {needsTikTokConnection && (
                    <Alert
                        icon={<IconInfoCircle size={16} />}
                        title={t('alerts.connectTikTok.title')}
                        color="orange"
                        variant="light"
                        radius="xl"
                        mb="md"
                        styles={{
                            root: {
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffeaa7'
                            }
                        }}
                    >
                        {t('alerts.connectTikTok.message')}
                    </Alert>
                )}

                {/* Main Content - Centered and Responsive */}
                <Box
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {campaignLoading || actionsLoading ? (
                        <LottieLoading isVisible={campaignLoading || actionsLoading} />
                    ) : campaignError || actionsError ? (
                        <Alert
                            icon={<IconInfoCircle size={16} />}
                            title={t('alerts.error.title')}
                            color="red"
                            variant="light"
                            radius="xl"
                            style={{
                                maxWidth: '100%',
                                backgroundColor: '#f8d7da',
                                border: '1px solid #f5c6cb'
                            }}
                        >
                            {campaignError || actionsError}
                        </Alert>
                    ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
                        <ExchangeEmptyState onRefresh={handleRefresh} loading={campaignLoading} />
                    ) : (
                        <CampaignCard
                            campaign={currentCampaign}
                            userActions={userActions || []}
                            onActionComplete={handleActionComplete}
                            onSkip={handleSkipCampaign}
                            hasMoreCampaigns={filteredCampaigns.length > 1}
                        />
                    )}
                </Box>
            </Container>
        </Box>
    );
}