// components/exchange/CampaignCard.tsx

'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Badge,
    Avatar,
    Text,
    Group,
    Stack,
    Progress,
    Loader,
    Box,
    Paper,
    ThemeIcon,
    Skeleton
} from '@mantine/core';
import {
    IconHeart,
    IconUsers,
    IconEye,
    IconMessageCircle,
    IconCheck,
    IconArrowRight,
    IconSparkles
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Campaign, Action } from '@/lib/api/exchange';
import { useExchange } from '@/hooks/useExchange';
import { useAuth } from '@/contexts/auth-context';
import { notifications } from '@mantine/notifications';

interface CampaignCardProps {
    campaign: Campaign;
    userActions: Action[];
    onActionComplete: () => void;
    onSkip: () => void;
    hasMoreCampaigns: boolean;
}

interface TikTokInfo {
    video_info?: any;
    user_info?: any;
}

export default function CampaignCard({
    campaign,
    userActions,
    onActionComplete,
    onSkip,
    hasMoreCampaigns
}: CampaignCardProps) {
    const t = useTranslations('Exchange');
    const { profile } = useAuth();
    const exchange = useExchange();

    // States
    const [actionState, setActionState] = useState<'idle' | 'opened' | 'claiming' | 'completed'>('idle');
    const [initialVideoInfo, setInitialVideoInfo] = useState<any>(null);
    const [completedAnimation, setCompletedAnimation] = useState(false);
    const [tikTokInfo, setTikTokInfo] = useState<TikTokInfo>({});
    const [isLoadingTikTokInfo, setIsLoadingTikTokInfo] = useState(false);
    const [tikTokInfoError, setTikTokInfoError] = useState<string | null>(null);

    // Computed values
    const actionType = campaign.campaign_type === 'follow' ? 'follow' : campaign.interaction_type;
    const hasPerformed = userActions.some(
        action => action.campaign_id === campaign.id && action.action_type === actionType
    );
    const canPerform = exchange.canPerformAction(campaign, userActions);
    const progressPercentage = exchange.getProgressPercentage(campaign.current_count, campaign.target_count);

    // Reset states when campaign changes
    useEffect(() => {
        setActionState('idle');
        setCompletedAnimation(false);
        setInitialVideoInfo(null);
        setTikTokInfo({});
        setTikTokInfoError(null);
        
        // Fetch TikTok info for new campaign
        fetchTikTokInfo();
    }, [campaign.id]);

    // Fetch TikTok information on-demand
    const fetchTikTokInfo = async () => {
        if (!campaign.target_tiktok_username) return;

        setIsLoadingTikTokInfo(true);
        setTikTokInfoError(null);

        try {
            let url: string;
            
            if (campaign.campaign_type === 'video' && campaign.tiktok_video_id) {
                url = `/api/exchange/tiktok-info?type=video&username=${encodeURIComponent(campaign.target_tiktok_username)}&videoId=${encodeURIComponent(campaign.tiktok_video_id)}`;
            } else {
                url = `/api/exchange/tiktok-info?type=profile&username=${encodeURIComponent(campaign.target_tiktok_username)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setTikTokInfo(data.data);
                
                // Set initial video info for like verification
                if (data.data.video_info && campaign.interaction_type === 'like') {
                    setInitialVideoInfo(data.data.video_info);
                }
            } else {
                setTikTokInfoError(data.error || 'Failed to fetch TikTok info');
            }
        } catch (error) {
            console.error('Error fetching TikTok info:', error);
            setTikTokInfoError('Network error while fetching TikTok info');
        } finally {
            setIsLoadingTikTokInfo(false);
        }
    };

    // Helper functions
    const getActionIcon = () => {
        switch (campaign.interaction_type || 'follow') {
            case 'like': return <IconHeart size={20} />;
            case 'view': return <IconEye size={20} />;
            case 'comment': return <IconMessageCircle size={20} />;
            case 'follow': return <IconUsers size={20} />;
            default: return <IconUsers size={20} />;
        }
    };

    const getActionLabel = () => {
        switch (campaign.interaction_type || 'follow') {
            case 'like': return t('actions.like');
            case 'view': return t('actions.view');
            case 'comment': return t('actions.comment');
            case 'follow': return t('actions.follow');
            default: return t('actions.follow');
        }
    };

    const getDisplayInfo = () => {
        // Show loading state while fetching TikTok info
        if (isLoadingTikTokInfo) {
            return {
                title: campaign.target_tiktok_username || 'Loading...',
                subtitle: 'Loading...',
                avatar: '',
                stats: [],
                isLoading: true
            };
        }

        // Show error state if failed to load
        if (tikTokInfoError) {
            return {
                title: campaign.target_tiktok_username || 'Unknown',
                subtitle: 'Failed to load info',
                avatar: '',
                stats: [],
                isError: true
            };
        }

        if (campaign.campaign_type === 'video' && tikTokInfo.video_info) {
            return {
                title: `@${campaign.target_tiktok_username || tikTokInfo.video_info.tiktokID}`,
                subtitle: `${exchange.formatCount(tikTokInfo.video_info.playCount)} ${t('stats.views')}`,
                avatar: tikTokInfo.video_info.url,
                stats: [
                    {
                        icon: <IconHeart size={16} />,
                        label: t('stats.likes'),
                        value: exchange.formatCount(tikTokInfo.video_info.diggCount)
                    },
                    {
                        icon: <IconMessageCircle size={16} />,
                        label: t('stats.comments'),
                        value: exchange.formatCount(tikTokInfo.video_info.commentCount)
                    }
                ]
            };
        } else if (campaign.campaign_type === 'follow' && tikTokInfo.user_info) {
            return {
                title: tikTokInfo.user_info.nickname,
                subtitle: `@${tikTokInfo.user_info.uniqueId}`,
                avatar: tikTokInfo.user_info.avatarThumb,
                stats: [
                    {
                        icon: <IconUsers size={16} />,
                        label: t('stats.followers'),
                        value: exchange.formatCount(tikTokInfo.user_info.followerCount)
                    },
                    {
                        icon: <IconUsers size={16} />,
                        label: t('stats.following'),
                        value: exchange.formatCount(tikTokInfo.user_info.followingCount)
                    }
                ]
            };
        }

        return {
            title: campaign.target_tiktok_username || 'Unknown',
            subtitle: '',
            avatar: '',
            stats: []
        };
    };

    // Event handlers
    const handleActionClick = () => {
        const url = exchange.generateTikTokUrl(campaign);
        if (url) {
            exchange.openTikTok(url);
            setActionState('opened');
        }
    };

    const handleClaimCredits = async () => {
        if (!profile?.tiktok_username) {
            notifications.show({
                title: t('notifications.connectTikTok.title'),
                message: t('notifications.connectTikTok.message'),
                color: 'red'
            });
            return;
        }

        setActionState('claiming');

        try {
            let result;

            if (campaign.campaign_type === 'follow') {
                result = await exchange.verifyFollowAction(
                    campaign.id,
                    campaign.target_tiktok_username!,
                    profile.tiktok_username
                );
            } else if (campaign.campaign_type === 'video' && campaign.interaction_type === 'like') {
                const previousCount = initialVideoInfo?.diggCount || 0;
                result = await exchange.verifyLikeAction(
                    campaign.id,
                    campaign,
                    previousCount
                );
            } else {
                result = await exchange.performAction({
                    campaignId: campaign.id,
                    actionType: actionType!,
                    proofData: {}
                });
            }

            if (result.success) {
                setActionState('completed');
                setCompletedAnimation(true);
                notifications.show({
                    title: t('notifications.success.title'),
                    message: `${t('notifications.success.creditsEarned')}: ${exchange.formatCredits(result.data?.creditsEarned || 0)}`,
                    color: 'green'
                });
                onActionComplete();
            } else {
                setActionState('idle'); // Reset to allow retry
                notifications.show({
                    title: t('notifications.error.actionNotDetected'),
                    message: result.error || t('notifications.error.tryAgain'),
                    color: 'red'
                });
            }
        } catch (error) {
            setActionState('idle'); // Reset to allow retry
            notifications.show({
                title: t('notifications.error.title'),
                message: error instanceof Error ? error.message : t('notifications.error.somethingWrong'),
                color: 'red'
            });
        }
    };

    const displayInfo = getDisplayInfo();

    return (
        <Card
            shadow="md"
            radius="xl"
            withBorder
            style={{
                width: '100%',
                maxWidth: '420px',
                maxHeight: '90vh',
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                overflow: 'hidden',
                margin: '0 auto'
            }}
        >
            <Box
                p="lg"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Main Content */}
                <Stack gap="lg" align="center" style={{ flex: 1, overflow: 'auto' }}>
                    {/* Avatar with Action Badge */}
                    <Box style={{ position: 'relative' }}>
                        {displayInfo.isLoading ? (
                            <Skeleton height={160} circle />
                        ) : (
                            <Avatar
                                src={displayInfo.avatar}
                                size={160}
                                radius="xl"
                                style={{
                                    border: '3px solid #f8f9fa',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                                }}
                            />
                        )}

                        <ThemeIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color={campaign.interaction_type === 'like' ? 'red' : 'blue'}
                            style={{
                                position: 'absolute',
                                bottom: -8,
                                right: -8,
                                border: '3px solid white',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            {getActionIcon()}
                        </ThemeIcon>
                    </Box>

                    {/* Title and Subtitle */}
                    <Stack gap="xs" align="center">
                        {displayInfo.isLoading ? (
                            <>
                                <Skeleton height={20} width={200} />
                                <Skeleton height={16} width={150} />
                            </>
                        ) : (
                            <>
                                <Text size="lg" fw={700} c="dark" ta="center" lineClamp={2}>
                                    {displayInfo.title}
                                </Text>
                                <Text size="sm" c="dimmed" ta="center" lineClamp={1}>
                                    {displayInfo.subtitle}
                                </Text>
                                {displayInfo.isError && (
                                    <Button
                                        size="xs"
                                        variant="light"
                                        color="blue"
                                        onClick={fetchTikTokInfo}
                                        disabled={isLoadingTikTokInfo}
                                    >
                                        {isLoadingTikTokInfo ? <Loader size={12} /> : 'Retry'}
                                    </Button>
                                )}
                            </>
                        )}
                    </Stack>

                    {/* Stats */}
                    {displayInfo.stats.length > 0 && (
                        <Group justify="center" gap="lg" w="100%">
                            {displayInfo.isLoading ? (
                                Array.from({ length: 2 }).map((_, index) => (
                                    <Stack key={index} gap={4} align="center">
                                        <Skeleton height={16} width={60} />
                                        <Skeleton height={14} width={40} />
                                    </Stack>
                                ))
                            ) : (
                                displayInfo.stats.slice(0, 2).map((stat, index) => (
                                    <Stack key={index} gap={4} align="center">
                                        <Group gap={4} justify="center">
                                            {stat.icon}
                                            <Text size="xs" c="dimmed">
                                                {stat.label}
                                            </Text>
                                        </Group>
                                        <Text fw={600} size="sm" c="dark">
                                            {stat.value}
                                        </Text>
                                    </Stack>
                                ))
                            )}
                        </Group>
                    )}

                    {/* Credits Info */}
                    <Paper
                        radius="xl"
                        p="md"
                        w="100%"
                        style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef'
                        }}
                    >
                        <Group justify="space-between" align="center">
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed">
                                    {t('credits.earn')}
                                </Text>
                                <Group align="center" gap="xs">
                                    <IconSparkles size={16} color="#f59e0b" />
                                    <Text size="lg" fw={700} c="#f59e0b">
                                        {exchange.formatCredits(campaign.credits_per_action)}
                                    </Text>
                                </Group>
                            </Stack>
                            <Stack gap={4} align="end">
                                <Text size="xs" c="dimmed">
                                    {t('credits.remaining')}
                                </Text>
                                <Text size="sm" fw={600} c="dark">
                                    {exchange.formatCredits(campaign.remaining_credits)}
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>

                    {/* Progress */}
                    <Box w="100%">
                        <Group justify="space-between" mb="xs">
                            <Text size="xs" c="dimmed">
                                {t('progress.label')}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {campaign.current_count}/{campaign.target_count}
                            </Text>
                        </Group>
                        <Progress
                            value={progressPercentage}
                            size="lg"
                            radius="xl"
                            color="blue"
                        />
                    </Box>
                </Stack>

                {/* Action Buttons */}
                <Stack gap="sm" mt="md">
                    {hasPerformed || actionState === 'completed' ? (
                        <Button
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="green"
                            leftSection={<IconCheck size={18} />}
                            disabled
                            style={{ fontWeight: 600 }}
                        >
                            {t('buttons.completed')}
                        </Button>
                    ) : !canPerform ? (
                        <Button
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="gray"
                            disabled
                        >
                            {campaign.status !== 'active' ? t('buttons.campaignCompleted') : t('buttons.insufficientCredits')}
                        </Button>
                    ) : (
                        <Group w="100%" gap="xs">
                            {/* Skip Button */}
                            <Button
                                size="lg"
                                radius="xl"
                                variant="outline"
                                color="gray"
                                leftSection={<IconArrowRight size={18} />}
                                onClick={onSkip}
                                disabled={!hasMoreCampaigns}
                                style={{
                                    flex: 1,
                                    fontWeight: 600,
                                    borderColor: '#dee2e6'
                                }}
                            >
                                {t('buttons.skip')}
                            </Button>

                            {/* Action/Claim Button */}
                            {actionState === 'idle' ? (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="filled"
                                    color={campaign.interaction_type === 'like' ? 'red' : 'blue'}
                                    leftSection={getActionIcon()}
                                    onClick={handleActionClick}
                                    style={{
                                        flex: 1,
                                        fontWeight: 600
                                    }}
                                >
                                    {getActionLabel()}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="filled"
                                    color="green"
                                    leftSection={exchange.verifyLoading ? <Loader size={18} /> : <IconSparkles size={18} />}
                                    onClick={handleClaimCredits}
                                    disabled={exchange.verifyLoading}
                                    style={{
                                        flex: 1,
                                        fontWeight: 600
                                    }}
                                >
                                    {exchange.verifyLoading ? t('buttons.processing') : t('buttons.claim')}
                                </Button>
                            )}
                        </Group>
                    )}
                </Stack>
            </Box>
        </Card>
    );
}