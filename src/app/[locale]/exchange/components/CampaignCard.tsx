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
    Skeleton,
    Badge,
    Divider,
    ActionIcon,
    Transition,
    Tooltip,
    rem
} from '@mantine/core';
import {
    IconHeart,
    IconUsers,
    IconEye,
    IconMessageCircle,
    IconCheck,
    IconArrowRight,
    IconSparkles,
    IconBolt,
    IconTarget,
    IconTrendingUp,
    IconRefresh,
    IconChevronRight,
    IconStar
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

    const getActionColor = () => {
        switch (campaign.interaction_type || 'follow') {
            case 'like': return 'red';
            case 'view': return 'blue';
            case 'comment': return 'teal';
            case 'follow': return 'violet';
            default: return 'violet';
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
        if (isLoadingTikTokInfo) {
            return {
                title: campaign.target_tiktok_username || 'Loading...',
                subtitle: 'Loading...',
                avatar: '',
                stats: [],
                isLoading: true
            };
        }

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
                title: videoInfo.author.nickname,
                subtitle: `@${videoInfo.author.uniqueId}`,
                avatar: videoInfo.video.zoomCover['720'] || videoInfo.video.cover,
                description: videoInfo.desc,
                verified: videoInfo.author.verified,
                stats: [
                    {
                        icon: <IconEye size={16} />,
                        label: t('stats.views'),
                        value: tikTokApi.formatCount(videoInfo.stats.playCount),
                        color: 'blue'
                    },
                    {
                        icon: <IconHeart size={16} />,
                        label: t('stats.likes'),
                        value: tikTokApi.formatCount(videoInfo.stats.diggCount),
                        color: 'red'
                    },
                    {
                        icon: <IconMessageCircle size={16} />,
                        label: t('stats.comments'),
                        value: tikTokApi.formatCount(videoInfo.stats.commentCount),
                        color: 'teal'
                    }
                ]
            };
        } else if (campaign.campaign_type === 'follow' && tikTokInfo.user_info) {
            const userInfo = tikTokInfo.user_info;
            return {
                title: userInfo.nickname,
                subtitle: `@${userInfo.uniqueId}`,
                avatar: userInfo.avatarThumb,
                verified: userInfo.verified,
                stats: [
                    {
                        icon: <IconUsers size={16} />,
                        label: t('stats.followers'),
                        value: tikTokApi.formatCount(userInfo.followerCount),
                        color: 'violet'
                    },
                    {
                        icon: <IconTrendingUp size={16} />,
                        label: t('stats.following'),
                        value: tikTokApi.formatCount(userInfo.followingCount),
                        color: 'blue'
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
                result = await exchange.verifyLikeAction(
                    campaign.id,
                    campaign,
                    campaign.tiktok_video_id!
                );
            } else if (campaign.campaign_type === 'video' && campaign.interaction_type === 'comment') {
                result = await exchange.verifyCommentAction(
                    campaign.id,
                    campaign,
                    profile.tiktok_username,
                    ''
                );
            } else {
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
                setActionState('idle');
                notifications.show({
                    title: t('notifications.error.actionNotDetected'),
                    message: result.error || t('notifications.error.tryAgain'),
                    color: 'red'
                });
            }
        } catch (error) {
            setActionState('idle');
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
            radius="xl"
            style={{
                width: '100%',
                maxWidth: rem(380),
                height: rem(600),
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden',
                margin: '0 auto',
                position: 'relative'
            }}
        >
            {/* Action Badge */}
            <Box
                style={{
                    position: 'absolute',
                    top: rem(16),
                    right: rem(16),
                    zIndex: 10
                }}
            >
                <Badge
                    size="lg"
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: getActionColor(), to: getActionColor(), deg: 45 }}
                    leftSection={getActionIcon()}
                    style={{
                        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    {getActionLabel()}
                </Badge>
            </Box>

            <Stack
                p="xl"
                gap="md"
                style={{
                    height: '100%',
                    position: 'relative'
                }}
            >
                {/* Avatar Section */}
                <Stack gap="sm" align="center">
                    <Box style={{ position: 'relative' }}>
                        {displayInfo.isLoading ? (
                            <Skeleton height={120} circle />
                        ) : (
                            <>
                                <Avatar
                                    src={displayInfo.avatar}
                                    size={120}
                                    radius="50%"
                                    style={{
                                        border: `4px solid ${getActionColor() === 'red' ? '#ff6b6b' : getActionColor() === 'violet' ? '#9775fa' : '#339af0'}`,
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                                    }}
                                />

                                {/* Verification badge */}
                                {displayInfo.verified && (
                                    <ThemeIcon
                                        size="sm"
                                        radius="xl"
                                        variant="filled"
                                        color="blue"
                                        style={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                            border: '2px solid white',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                        }}
                                    >
                                        <IconStar size={12} />
                                    </ThemeIcon>
                                )}
                            </>
                        )}
                    </Box>

                    {/* Title and Subtitle */}
                    <Stack gap={4} align="center">
                        {displayInfo.isLoading ? (
                            <>
                                <Skeleton height={20} width={180} />
                                <Skeleton height={16} width={120} />
                            </>
                        ) : (
                            <>
                                <Text
                                    size="lg"
                                    fw={700}
                                    c="dark"
                                    ta="center"
                                    lineClamp={1}
                                    style={{
                                        maxWidth: '100%'
                                    }}
                                >
                                    {displayInfo.title}
                                </Text>
                                <Text size="sm" c="dimmed" ta="center" lineClamp={1}>
                                    {displayInfo.subtitle}
                                </Text>

                                {/* Description for video campaigns */}
                                {displayInfo.description && (
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        ta="center"
                                        lineClamp={2}
                                        style={{
                                            maxWidth: rem(280),
                                            marginTop: rem(4)
                                        }}
                                    >
                                        {displayInfo.description}
                                    </Text>
                                )}

                                {displayInfo.isError && (
                                    <ActionIcon
                                        size="sm"
                                        variant="light"
                                        color="blue"
                                        onClick={fetchTikTokInfo}
                                        disabled={isLoadingTikTokInfo}
                                    >
                                        {isLoadingTikTokInfo ? <Loader size={12} /> : <IconRefresh size={12} />}
                                    </ActionIcon>
                                )}
                            </>
                        )}
                    </Stack>
                </Stack>

                {/* Stats Grid */}
                {displayInfo.stats.length > 0 && (
                    <Group justify="center" gap="xs">
                        {displayInfo.isLoading ? (
                            Array.from({ length: 2 }).map((_, index) => (
                                <Paper
                                    key={index}
                                    radius="md"
                                    p="xs"
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        minWidth: rem(85)
                                    }}
                                >
                                    <Stack gap={4} align="center">
                                        <Skeleton height={14} width={50} />
                                        <Skeleton height={12} width={30} />
                                    </Stack>
                                </Paper>
                            ))
                        ) : (
                            displayInfo.stats.slice(0, 3).map((stat, index) => (
                                <Paper
                                    key={index}
                                    radius="md"
                                    p="xs"
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        minWidth: rem(85),
                                        flex: 1,
                                        maxWidth: rem(100)
                                    }}
                                >
                                    <Stack gap={2} align="center">
                                        <Group gap={4} justify="center">
                                            <ThemeIcon
                                                size="xs"
                                                variant="light"
                                                color={stat.color}
                                            >
                                                {stat.icon}
                                            </ThemeIcon>
                                        </Group>
                                        <Text fw={600} size="xs" c="dark" ta="center">
                                            {stat.value}
                                        </Text>
                                        <Text size="xs" c="dimmed" ta="center">
                                            {stat.label}
                                        </Text>
                                    </Stack>
                                </Paper>
                            ))
                        )}
                    </Group>
                )}

                <Divider style={{ margin: `${rem(8)} 0` }} />

                {/* Credits and Progress Section */}
                <Stack gap="sm">
                    {/* Credits Info */}
                    <Paper
                        radius="lg"
                        p="md"
                        style={{
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                            border: '1px solid #ffd93d'
                        }}
                    >
                        <Group justify="space-between" align="center">
                            <Stack gap={2}>
                                <Group align="center" gap="xs">
                                    <IconSparkles size={18} color="#f59e0b" />
                                    <Text size="sm" fw={600} c="#f59e0b">
                                        {t('credits.earn')}
                                    </Text>
                                </Group>
                                <Text size="xl" fw={800} c="#d97706">
                                    {exchange.formatCredits(campaign.credits_per_action)}
                                </Text>
                            </Stack>

                            <Stack gap={2} align="end">
                                <Group align="center" gap="xs">
                                    <IconTarget size={16} color="#6b7280" />
                                    <Text size="xs" c="dimmed">
                                        {t('credits.remaining')}
                                    </Text>
                                </Group>
                                <Text size="sm" fw={600} c="dark">
                                    {exchange.formatCredits(campaign.remaining_credits)}
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>

                    {/* Progress Bar */}
                    <Box>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" c="dimmed" fw={500}>
                                {t('progress.label')}
                            </Text>
                            <Text size="xs" c="dimmed" fw={600}>
                                {campaign.current_count}/{campaign.target_count}
                            </Text>
                        </Group>
                        <Progress
                            value={progressPercentage}
                            size="lg"
                            radius="xl"
                            styles={{
                                section: {
                                    background: `linear-gradient(45deg, ${getActionColor() === 'red' ? '#ff6b6b' : getActionColor() === 'violet' ? '#9775fa' : '#339af0'}, ${getActionColor() === 'red' ? '#ee5a24' : getActionColor() === 'violet' ? '#7c3aed' : '#228be6'}) !important`
                                }
                            }}
                        />
                    </Box>
                </Stack>

                {/* Action Buttons */}
                <Stack gap="xs" style={{ marginTop: 'auto' }}>
                    {hasPerformed || actionState === 'completed' ? (
                        <Transition
                            mounted={actionState === 'completed'}
                            transition="scale"
                            duration={300}
                        >
                            {(styles) => (
                                <Button
                                    style={styles}
                                    size="lg"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'green', to: 'teal' }}
                                    leftSection={<IconCheck size={20} />}
                                    disabled
                                    styles={{
                                        root: {
                                            fontWeight: 600,
                                            height: rem(50),
                                            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
                                        }
                                    }}
                                >
                                    {t('buttons.completed')}
                                </Button>
                            )}
                        </Transition>
                    ) : !canPerform ? (
                        <Button
                            size="lg"
                            radius="xl"
                            variant="light"
                            color="gray"
                            disabled
                            styles={{
                                root: {
                                    height: rem(50),
                                    fontWeight: 600
                                }
                            }}
                        >
                            {campaign.status !== 'active' ? t('buttons.campaignCompleted') : t('buttons.insufficientCredits')}
                        </Button>
                    ) : (
                        <Group gap="xs">
                            {/* Skip Button */}
                            <Tooltip label={hasMoreCampaigns ? t('buttons.skip') : t('buttons.noMoreCampaigns')}>
                                <ActionIcon
                                    size={50}
                                    radius="xl"
                                    variant="light"
                                    color="gray"
                                    onClick={onSkip}
                                    disabled={!hasMoreCampaigns}
                                    style={{
                                        border: '2px solid #dee2e6'
                                    }}
                                >
                                    <IconChevronRight size={20} />
                                </ActionIcon>
                            </Tooltip>

                            {/* Main Action Button */}
                            {actionState === 'idle' ? (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{
                                        from: getActionColor() === 'red' ? 'red' : getActionColor() === 'violet' ? 'violet' : 'blue',
                                        to: getActionColor() === 'red' ? 'pink' : getActionColor() === 'violet' ? 'grape' : 'cyan'
                                    }}
                                    leftSection={getActionIcon()}
                                    onClick={handleActionClick}
                                    style={{
                                        flex: 1,
                                        height: rem(50),
                                        fontWeight: 600,
                                        boxShadow: `0 4px 16px ${getActionColor() === 'red' ? 'rgba(255, 107, 107, 0.3)' : getActionColor() === 'violet' ? 'rgba(151, 117, 250, 0.3)' : 'rgba(51, 154, 240, 0.3)'}`
                                    }}
                                >
                                    {getActionLabel()}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'orange', to: 'yellow' }}
                                    leftSection={
                                        exchange.verifyLoading ?
                                            <Loader size={20} color="white" /> :
                                            <IconBolt size={20} />
                                    }
                                    onClick={handleClaimCredits}
                                    disabled={exchange.verifyLoading}
                                    style={{
                                        flex: 1,
                                        height: rem(50),
                                        fontWeight: 600,
                                        boxShadow: '0 4px 16px rgba(251, 146, 60, 0.3)'
                                    }}
                                >
                                    {exchange.verifyLoading ? t('buttons.processing') : t('buttons.claim')}
                                </Button>
                            )}
                        </Group>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}