// components/exchange/CampaignCard.tsx

'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Button,
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
import { useTikTokApi } from '@/hooks/useTikTok';
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
    user_info?: {
        uniqueId: string;
        nickname: string;
        avatarThumb: string;
        followerCount: number;
        followingCount: number;
        verified: boolean;
    };
    video_info?: {
        id: string;
        desc: string;
        createTime: string;
        author: {
            uniqueId: string;
            nickname: string;
            avatarThumb: string;
            verified: boolean;
        };
        stats: {
            diggCount: number;
            commentCount: number;
            playCount: number;
            shareCount: number;
            collectCount: number;
        };
        video: {
            duration: number;
            height: number;
            width: number;
            cover: string;
            playAddr: string;
            downloadAddr: string;
            zoomCover: {
                '240': string;
                '480': string;
                '720': string;
                '960': string;
            };
        };
        music: {
            id: string;
            title: string;
            authorName: string;
            duration: number;
            original: boolean;
        };
    };
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
    const tikTokApi = useTikTokApi();

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

    // Fetch TikTok information using new API hooks
    const fetchTikTokInfo = async () => {
        if (!campaign.target_tiktok_username) return;

        setIsLoadingTikTokInfo(true);
        setTikTokInfoError(null);

        try {
            if (campaign.campaign_type === 'video' && campaign.tiktok_video_id) {
                // Fetch video post detail
                const postResponse = await tikTokApi.getPostDetail(campaign.tiktok_video_id);

                if (postResponse.success && postResponse.data) {
                    const postDetail = postResponse.data.itemInfo?.itemStruct;

                    if (postDetail) {
                        const videoInfo = {
                            id: postDetail.id,
                            desc: postDetail.desc,
                            createTime: postDetail.createTime,
                            author: {
                                uniqueId: postDetail.author.uniqueId,
                                nickname: postDetail.author.nickname,
                                avatarThumb: postDetail.author.avatarThumb,
                                verified: postDetail.author.verified
                            },
                            stats: {
                                diggCount: parseInt(postDetail.stats.diggCount.toString()),
                                commentCount: postDetail.stats.commentCount,
                                playCount: parseInt(postDetail.stats.playCount.toString()),
                                shareCount: parseInt(postDetail.stats.shareCount.toString()),
                                collectCount: parseInt(postDetail.stats.collectCount.toString())
                            },
                            video: {
                                duration: postDetail.video.duration,
                                height: postDetail.video.height,
                                width: postDetail.video.width,
                                cover: postDetail.video.cover,
                                playAddr: postDetail.video.playAddr,
                                downloadAddr: postDetail.video.downloadAddr,
                                zoomCover: postDetail.video.zoomCover
                            },
                            music: {
                                id: postDetail.music.id,
                                title: postDetail.music.title,
                                authorName: postDetail.music.authorName,
                                duration: postDetail.music.duration,
                                original: postDetail.music.original
                            }
                        };

                        setTikTokInfo({ video_info: videoInfo });

                        // Set initial video info for like verification
                        if (campaign.interaction_type === 'like') {
                            setInitialVideoInfo(videoInfo);
                        }
                    } else {
                        setTikTokInfoError('Invalid post data structure');
                    }
                } else {
                    setTikTokInfoError(postResponse.error || 'Failed to fetch post info');
                }
            } else if (campaign.campaign_type === 'follow') {
                // Fetch user profile
                const profileResponse = await tikTokApi.getProfile(campaign.target_tiktok_username);

                if (profileResponse.success && profileResponse.data) {
                    const userInfo = {
                        uniqueId: profileResponse.data.user.uniqueId,
                        nickname: profileResponse.data.user.nickname,
                        avatarThumb: profileResponse.data.user.avatarThumb,
                        followerCount: profileResponse.data.stats.followerCount,
                        followingCount: profileResponse.data.stats.followingCount,
                        verified: profileResponse.data.user.verified
                    };

                    setTikTokInfo({ user_info: userInfo });
                } else {
                    setTikTokInfoError(profileResponse.error || 'Failed to fetch profile info');
                }
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
            const videoInfo = tikTokInfo.video_info;
            return {
                title: `@${videoInfo.author.uniqueId}`,
                subtitle: `${tikTokApi.formatCount(videoInfo.stats.playCount)} ${t('stats.views')}`,
                avatar: videoInfo.video.zoomCover['720'] || videoInfo.video.cover,
                stats: [
                    {
                        icon: <IconHeart size={16} />,
                        label: t('stats.likes'),
                        value: tikTokApi.formatCount(videoInfo.stats.diggCount)
                    },
                    {
                        icon: <IconMessageCircle size={16} />,
                        label: t('stats.comments'),
                        value: tikTokApi.formatCount(videoInfo.stats.commentCount)
                    }
                ]
            };
        } else if (campaign.campaign_type === 'follow' && tikTokInfo.user_info) {
            const userInfo = tikTokInfo.user_info;
            return {
                title: userInfo.nickname,
                subtitle: `@${userInfo.uniqueId}`,
                avatar: userInfo.avatarThumb,
                stats: [
                    {
                        icon: <IconUsers size={16} />,
                        label: t('stats.followers'),
                        value: tikTokApi.formatCount(userInfo.followerCount)
                    },
                    {
                        icon: <IconUsers size={16} />,
                        label: t('stats.following'),
                        value: tikTokApi.formatCount(userInfo.followingCount)
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
                // Use the new follow verification method
                result = await exchange.verifyFollowAction(
                    campaign.id,
                    campaign.target_tiktok_username!,
                    profile.tiktok_username
                );
            } else if (campaign.campaign_type === 'video' && campaign.interaction_type === 'like') {
                // Use the new like verification method with video ID
                result = await exchange.verifyLikeAction(
                    campaign.id,
                    campaign,
                    campaign.tiktok_video_id!
                );
            } else if (campaign.campaign_type === 'video' && campaign.interaction_type === 'comment') {
                // Use comment verification method
                result = await exchange.verifyCommentAction(
                    campaign.id,
                    campaign,
                    profile.tiktok_username,
                    '' // Comment text - could be from user input
                );
            } else {
                // Fallback to generic action
                result = await exchange.performAction({
                    campaignId: campaign.id,
                    actionType: actionType!,
                    proofData: {
                        targetUsername: campaign.target_tiktok_username,
                        videoId: campaign.tiktok_video_id,
                        userTikTok: profile.tiktok_username
                    }
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