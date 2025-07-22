// src/components/profile/TikTokConnection.tsx
'use client';

import { useState } from 'react';
import {
    Card,
    Group,
    Text,
    Button,
    TextInput,
    Avatar,
    Badge,
    Stack,
    Alert,
    Modal,
    SimpleGrid,
    ActionIcon,
    Loader,
    Box,
    Divider,
    Center,
    Progress,
    Transition,
    Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBrandTiktok,
    IconUnlink,
    IconRefresh,
    IconAlertCircle,
    IconCheck,
    IconX,
    IconSearch,
    IconSparkles,
    IconUsers,
    IconHeart,
    IconVideo,
    IconUserPlus,
    IconClock
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';
import { useTikTokApi } from '@/hooks/useTikTok';
import type { ProfileResponse } from '@/lib/api/tiktok';
import classes from './TikTokConnection.module.css';

interface TikTokConnectionProps {
    profile: Profile;
    tiktokAvatar: string | null;
    fetchingAvatar: boolean;
    onUpdate: () => void;
}

export default function TikTokConnection({
    profile,
    tiktokAvatar,
    fetchingAvatar,
    onUpdate
}: TikTokConnectionProps) {
    const t = useTranslations('Profile');
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<ProfileResponse | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [disconnectOpened, { open: openDisconnect, close: closeDisconnect }] = useDisclosure(false);
    const { connectTikTok, disconnectTikTok } = useProfile();
    const { getProfile: getTikTokProfile } = useTikTokApi();

    const form = useForm({
        initialValues: {
            username: '',
        },
        validate: {
            username: (value) => {
                if (!value.trim()) return t('messages.invalidUsername');
                if (value.includes('@')) return t('forms.connectTiktok.helperText');
                return null;
            },
        },
    });

    const handlePreview = async (values: { username: string }) => {
        setPreviewLoading(true);
        setPreviewData(null);
        setShowPreview(false);

        try {
            const response = await getTikTokProfile(values.username);

            if (response.success && response.data) {
                setPreviewData(response);
                setShowPreview(true);
            } else {
                notifications.show({
                    title: 'Error',
                    message: response.error || t('messages.connectError'),
                    color: 'red',
                });
            }
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error instanceof Error ? error.message : t('messages.connectError'),
                color: 'red',
            });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleConfirmConnect = async () => {
        if (!previewData?.data?.user?.uniqueId) return;

        setLoading(true);
        try {
            await connectTikTok({ username: previewData.data.user.uniqueId });
            notifications.show({
                title: t('common.success'),
                message: t('messages.connectSuccess'),
                color: 'green',
            });
            form.reset();
            setShowPreview(false);
            setPreviewData(null);
            onUpdate();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error instanceof Error ? error.message : t('messages.connectError'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPreview = () => {
        setShowPreview(false);
        setPreviewData(null);
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            await disconnectTikTok();
            notifications.show({
                title: t('common.success'),
                message: t('messages.disconnectSuccess'),
                color: 'green',
            });
            closeDisconnect();
            onUpdate();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error instanceof Error ? error.message : t('messages.disconnectError'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number | string) => {
        const number = typeof num === 'string' ? parseInt(num) : num;
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toLocaleString();
    };

    const tiktokStats = profile.tiktok_stats;

    if (!profile.tiktok_username) {
        return (
            <Card padding={0} radius="xl" className={classes.connectionCard}>
                <Box className={classes.cardHeader}>
                    <Group>
                        <Box className={classes.tiktokIcon}>
                            <IconBrandTiktok size={24} />
                        </Box>
                        <Text fw={700} size="xl" c="white">
                            {t('sections.tiktok')}
                        </Text>
                    </Group>
                </Box>

                <Box p="xl">
                    <Stack gap="lg">
                        <Alert
                            icon={<IconSparkles size="1.2rem" />}
                            className={classes.connectAlert}
                            radius="md"
                        >
                            <Text fw={600} size="md" mb="xs">
                                {t('empty.noTiktok')}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {t('empty.noTiktokDescription')}
                            </Text>
                        </Alert>

                        <form onSubmit={form.onSubmit(handlePreview)}>
                            <Stack gap="md">
                                <TextInput
                                    label={t('forms.connectTiktok.title')}
                                    placeholder={t('forms.connectTiktok.placeholder')}
                                    description={t('forms.connectTiktok.helperText')}
                                    {...form.getInputProps('username')}
                                    leftSection={<Text size="sm" fw={600}>@</Text>}
                                    size="lg"
                                    radius="md"
                                    classNames={{
                                        input: classes.usernameInput,
                                        label: classes.inputLabel
                                    }}
                                />
                                <Button
                                    type="submit"
                                    loading={previewLoading}
                                    leftSection={<IconSearch size="1.2rem" />}
                                    size="lg"
                                    radius="md"
                                    className={classes.searchButton}
                                    disabled={!form.values.username.trim()}
                                    fullWidth
                                >
                                    {t('actions.preview')}
                                </Button>
                            </Stack>
                        </form>

                        {/* TikTok Profile Preview */}
                        <Transition
                            mounted={showPreview && previewData?.data !== null}
                            transition="slide-up"
                            duration={400}
                            timingFunction="ease"
                        >
                            {(styles) => (
                                <Box style={styles}>
                                    {previewData?.data && (
                                        <>
                                            <Divider
                                                my="xl"
                                                label={
                                                    <Group gap="xs">
                                                        <IconSparkles size={16} />
                                                        <Text fw={600}>{t('forms.preview.title')}</Text>
                                                    </Group>
                                                }
                                                labelPosition="center"
                                            />

                                            <Card className={classes.previewCard} padding="xl" radius="lg">
                                                <Stack gap="lg">
                                                    <Group>
                                                        <Avatar
                                                            src={previewData.data.user.avatarMedium}
                                                            size={80}
                                                            radius="xl"
                                                            className={classes.previewAvatar}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <Group gap="xs" mb={4}>
                                                                <Text fw={700} size="xl">
                                                                    {previewData.data.user.nickname}
                                                                </Text>
                                                                {previewData.data.user.verified && (
                                                                    <Badge
                                                                        variant="gradient"
                                                                        gradient={{ from: 'blue', to: 'cyan' }}
                                                                        size="sm"
                                                                    >
                                                                        {t('forms.preview.verified')}
                                                                    </Badge>
                                                                )}
                                                            </Group>
                                                            <Text size="md" c="dimmed" mb={4}>
                                                                @{previewData.data.user.uniqueId}
                                                            </Text>
                                                            {previewData.data.user.signature && (
                                                                <Text size="sm" c="dimmed" lineClamp={2}>
                                                                    {previewData.data.user.signature}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    </Group>

                                                    <SimpleGrid cols={4} spacing="md">
                                                        {[
                                                            {
                                                                icon: IconUsers,
                                                                value: previewData.data.stats.followerCount,
                                                                label: t('forms.preview.followers'),
                                                                color: '#FE2C55'
                                                            },
                                                            {
                                                                icon: IconUserPlus,
                                                                value: previewData.data.stats.followingCount,
                                                                label: t('forms.preview.following'),
                                                                color: '#25F4EE'
                                                            },
                                                            {
                                                                icon: IconHeart,
                                                                value: previewData.data.stats.heartCount,
                                                                label: t('forms.preview.likes'),
                                                                color: '#EE1D52'
                                                            },
                                                            {
                                                                icon: IconVideo,
                                                                value: previewData.data.stats.videoCount,
                                                                label: t('forms.preview.videos'),
                                                                color: '#764ba2'
                                                            },
                                                        ].map((stat, index) => (
                                                            <Paper
                                                                key={index}
                                                                className={classes.statBox}
                                                                p="md"
                                                                radius="md"
                                                            >
                                                                <Center>
                                                                    <Stack gap={4} align="center">
                                                                        <stat.icon size={20} color={stat.color} />
                                                                        <Text fw={700} size="lg">
                                                                            {formatNumber(stat.value || 0)}
                                                                        </Text>
                                                                        <Text size="xs" c="dimmed">
                                                                            {stat.label}
                                                                        </Text>
                                                                    </Stack>
                                                                </Center>
                                                            </Paper>
                                                        ))}
                                                    </SimpleGrid>
                                                </Stack>
                                            </Card>

                                            <Group justify="space-between" mt="xl">
                                                <Button
                                                    variant="light"
                                                    color="gray"
                                                    leftSection={<IconX size="1rem" />}
                                                    onClick={handleCancelPreview}
                                                    size="lg"
                                                    radius="md"
                                                >
                                                    {t('actions.cancel')}
                                                </Button>
                                                <Button
                                                    leftSection={<IconCheck size="1rem" />}
                                                    loading={loading}
                                                    onClick={handleConfirmConnect}
                                                    size="lg"
                                                    radius="md"
                                                    className={classes.confirmButton}
                                                >
                                                    {t('actions.connectTiktok')}
                                                </Button>
                                            </Group>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Transition>
                    </Stack>
                </Box>
            </Card>
        );
    }

    return (
        <>
            <Card padding={0} radius="xl" className={classes.connectedCard}>
                <Box className={classes.connectedHeader}>
                    <Group justify="space-between">
                        <Group>
                            <Box className={classes.tiktokIcon}>
                                <IconBrandTiktok size={24} />
                            </Box>
                            <Text fw={700} size="xl" c="white">
                                {t('sections.tiktok')}
                            </Text>
                            <Badge
                                size="lg"
                                variant="light"
                                color="green"
                                leftSection={<IconCheck size={14} />}
                                className={classes.connectedBadge}
                            >
                                {t('status.connected')}
                            </Badge>
                        </Group>
                        <Group>
                            <ActionIcon
                                variant="white"
                                size="lg"
                                radius="md"
                                onClick={onUpdate}
                                loading={fetchingAvatar}
                                className={classes.refreshButton}
                            >
                                <IconRefresh size="1.2rem" />
                            </ActionIcon>
                            <Button
                                variant="white"
                                color="red"
                                leftSection={<IconUnlink size="1rem" />}
                                onClick={openDisconnect}
                                size="md"
                                radius="md"
                                className={classes.disconnectButton}
                            >
                                {t('actions.disconnectTiktok')}
                            </Button>
                        </Group>
                    </Group>
                </Box>

                <Box p="xl">
                    <Stack gap="xl">
                        {/* Profile Info */}
                        <Group gap="lg">
                            <Box className={classes.avatarWrapper}>
                                <Avatar
                                    src={tiktokAvatar}
                                    size={100}
                                    radius="xl"
                                    className={classes.connectedAvatar}
                                >
                                    {fetchingAvatar ? (
                                        <Loader size="sm" color="white" />
                                    ) : (
                                        <IconBrandTiktok size="2rem" />
                                    )}
                                </Avatar>
                                <Box className={classes.avatarGlow} />
                            </Box>
                            <div style={{ flex: 1 }}>
                                <Text fw={700} size="2rem" className={classes.username}>
                                    @{profile.tiktok_username}
                                </Text>
                                <Group gap="xs" mt="xs">
                                    <Badge
                                        variant="light"
                                        color="gray"
                                        leftSection={<IconClock size={12} />}
                                    >
                                        {t('fields.lastActive')}: {new Date(profile.last_active_at).toLocaleDateString()}
                                    </Badge>
                                </Group>
                            </div>
                        </Group>

                        {/* Stats Grid */}
                        {tiktokStats && (
                            <Box>
                                <Text fw={600} size="lg" mb="md" c="dimmed">
                                    {t('sections.statistics')}
                                </Text>
                                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                                    {[
                                        {
                                            icon: IconUsers,
                                            value: tiktokStats.followerCount,
                                            label: t('fields.followers'),
                                            color: '#FE2C55',
                                            progress: 85
                                        },
                                        {
                                            icon: IconUserPlus,
                                            value: tiktokStats.followingCount,
                                            label: t('fields.following'),
                                            color: '#25F4EE',
                                            progress: 60
                                        },
                                        {
                                            icon: IconHeart,
                                            value: tiktokStats.heartCount,
                                            label: t('fields.likes'),
                                            color: '#EE1D52',
                                            progress: 92
                                        },
                                        {
                                            icon: IconVideo,
                                            value: tiktokStats.videoCount,
                                            label: t('fields.videos'),
                                            color: '#764ba2',
                                            progress: 75
                                        },
                                    ].map((stat, index) => (
                                        <Card
                                            key={index}
                                            className={classes.statCard}
                                            padding="lg"
                                            radius="lg"
                                        >
                                            <Stack gap="xs">
                                                <stat.icon size={24} color={stat.color} />
                                                <Text fw={800} size="1.5rem">
                                                    {formatNumber(stat.value || 0)}
                                                </Text>
                                                <Text size="xs" c="dimmed" fw={600}>
                                                    {stat.label}
                                                </Text>
                                                <Progress
                                                    value={stat.progress}
                                                    color={stat.color}
                                                    size="xs"
                                                    radius="xl"
                                                />
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Card>

            <Modal
                opened={disconnectOpened}
                onClose={closeDisconnect}
                title={
                    <Group gap="xs">
                        <IconAlertCircle size={24} color="red" />
                        <Text fw={600} size="lg">{t('modals.disconnect.title')}</Text>
                    </Group>
                }
                centered
                radius="lg"
                size="md"
            >
                <Stack gap="lg">
                    <Text size="md">
                        {t('modals.disconnect.message')}
                    </Text>
                    <Group justify="flex-end" gap="md">
                        <Button
                            variant="light"
                            onClick={closeDisconnect}
                            radius="md"
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            color="red"
                            loading={loading}
                            onClick={handleDisconnect}
                            radius="md"
                            leftSection={<IconUnlink size="1rem" />}
                        >
                            {t('actions.disconnectTiktok')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}