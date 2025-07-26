// app/[locale]/exchange/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Stack,
    Alert,
    Box,
    SegmentedControl,
    Group,
    Paper,
    Title,
    Text,
    Transition,
    rem
} from '@mantine/core';
import { IconInfoCircle, IconSparkles } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useExchangeCampaigns, useUserActions } from '@/hooks/useExchange';
import { useAuth } from '@/contexts/auth-context';
import CampaignCard from './components/CampaignCard';
import ExchangeEmptyState from './components/ExchangeEmptyState';
import LottieLoading from '@/components/ui/loading/loading-overlay';

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
                    padding: rem(16),
                    zIndex: 1
                }}
            >
                {/* TikTok Connection Alert - Compact */}
                <Transition
                    mounted={needsTikTokConnection}
                    transition="slide-down"
                    duration={200}
                    timingFunction="ease"
                >
                    {(styles) => (
                        <Paper
                            style={{
                                ...styles,
                                background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
                                borderRadius: rem(16),
                                padding: `${rem(8)} ${rem(16)}`,
                                marginBottom: rem(12),
                                boxShadow: '0 4px 16px rgba(255, 154, 86, 0.25)'
                            }}
                        >
                            <Group gap="xs" align="center">
                                <IconInfoCircle size={16} color="white" />
                                <Text size="xs" style={{ color: 'white', fontWeight: 500 }}>
                                    {t('alerts.connectTikTok.title')}
                                </Text>
                            </Group>
                        </Paper>
                    )}
                </Transition>

                {/* Compact Header - Filters Only */}
                <Group justify="center" mb="sm">
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
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                        styles={{
                            control: {
                                border: 'none',
                                fontWeight: 600,
                                fontSize: rem(13),
                                color: '#666'
                            },
                            indicator: {
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
                            },
                            label: {
                                '&[dataActive="true"]': {
                                    color: 'white !important',
                                    fontWeight: 600
                                }
                            }
                        }}
                    />
                </Group>

                {/* Main Content */}
                <Box
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 0
                    }}
                >
                    {campaignLoading || actionsLoading ? (
                        <Paper
                            radius="xl"
                            p="xl"
                            style={{
                                background: 'white',
                                border: '1px solid #e9ecef',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <LottieLoading isVisible={campaignLoading || actionsLoading} />
                        </Paper>
                    ) : campaignError || actionsError ? (
                        <Alert
                            icon={<IconInfoCircle size={18} />}
                            title={t('alerts.error.title')}
                            color="red"
                            variant="filled"
                            radius="xl"
                            style={{
                                maxWidth: '100%',
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                border: 'none',
                                color: 'white',
                                boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
                            }}
                        >
                            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {campaignError || actionsError}
                            </Text>
                        </Alert>
                    ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
                        <ExchangeEmptyState onRefresh={handleRefresh} loading={campaignLoading} />
                    ) : (
                        <Transition
                            mounted={!!currentCampaign}
                            transition="scale"
                            duration={300}
                            timingFunction="ease"
                        >
                            {(styles) => (
                                <div style={styles}>
                                    <CampaignCard
                                        campaign={currentCampaign}
                                        userActions={userActions || []}
                                        onActionComplete={handleActionComplete}
                                        onSkip={handleSkipCampaign}
                                        hasMoreCampaigns={filteredCampaigns.length > 1}
                                    />
                                </div>
                            )}
                        </Transition>
                    )}
                </Box>

                {/* Footer Stats - More Compact */}
                {filteredCampaigns.length > 0 && (
                    <Group justify="center" gap="lg" mt="sm">
                        <Paper
                            radius="xl"
                            px="md"
                            py="xs"
                            style={{
                                background: 'white',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <Group gap="xs" align="center">
                                <Text size="sm" fw={600} c="dark">
                                    {filteredCampaigns.length}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    campaigns
                                </Text>
                            </Group>
                        </Paper>

                        <Paper
                            radius="xl"
                            px="md"
                            py="xs"
                            style={{
                                background: 'white',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <Group gap="xs" align="center">
                                <IconSparkles size={14} color="#f59e0b" />
                                <Text size="sm" fw={600} c="#f59e0b">
                                    {filteredCampaigns.reduce((sum, c) => sum + c.credits_per_action, 0)}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    credits
                                </Text>
                            </Group>
                        </Paper>
                    </Group>
                )}
            </Container>
        </Box>
    );
}