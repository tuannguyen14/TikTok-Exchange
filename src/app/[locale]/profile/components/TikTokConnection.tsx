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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandTiktok, IconUnlink, IconRefresh, IconAlertCircle, IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';
import { useTikTokApi } from '@/hooks/useTikTok';

// Import types from your TikTok API client
import type { ProfileResponse } from '@/lib/api/tiktok';

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
            <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                    <Group>
                        <IconBrandTiktok size={24} color="#FE2C55" />
                        <Text fw={600} size="lg">
                            {t('sections.tiktok')}
                        </Text>
                    </Group>

                    <Alert icon={<IconAlertCircle size="1rem" />} color="blue">
                        {t('empty.noTiktokDescription')}
                    </Alert>

                    <form onSubmit={form.onSubmit(handlePreview)}>
                        <Stack gap="md">
                            <TextInput
                                label={t('forms.connectTiktok.title')}
                                placeholder={t('forms.connectTiktok.placeholder')}
                                description={t('forms.connectTiktok.helperText')}
                                {...form.getInputProps('username')}
                                leftSection={<Text size="sm">@</Text>}
                            />
                            <Button
                                type="submit"
                                loading={previewLoading}
                                leftSection={<IconSearch size="1rem" />}
                                color="#FE2C55"
                                disabled={!form.values.username.trim()}
                            >
                                {t('actions.preview')}
                            </Button>
                        </Stack>
                    </form>

                    {/* TikTok Profile Preview */}
                    {showPreview && previewData?.data && (
                        <Box>
                            <Divider my="md" />
                            <Stack gap="md">
                                <Text fw={600} size="md" c="#FE2C55">
                                    {t('forms.preview.title')}
                                </Text>

                                <Card padding="md" radius="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                                    <Stack gap="md">
                                        <Group>
                                            <Avatar
                                                src={previewData.data.user.avatarMedium}
                                                size="lg"
                                                radius="md"
                                            />
                                            <div style={{ flex: 1 }}>
                                                <Group>
                                                    <Text fw={600} size="lg">
                                                        {previewData.data.user.nickname}
                                                    </Text>
                                                    {previewData.data.user.verified && (
                                                        <Badge color="blue" variant="light" size="sm">
                                                            {t('forms.preview.verified')}
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Text size="sm" c="dimmed">
                                                    @{previewData.data.user.uniqueId}
                                                </Text>
                                                {previewData.data.user.signature && (
                                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                                        {previewData.data.user.signature}
                                                    </Text>
                                                )}
                                            </div>
                                        </Group>

                                        <SimpleGrid cols={4} spacing="xs">
                                            <Center>
                                                <Stack gap={2} align="center">
                                                    <Text fw={700} size="sm">
                                                        {formatNumber(previewData.data.stats.followerCount || 0)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {t('forms.preview.followers')}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                            <Center>
                                                <Stack gap={2} align="center">
                                                    <Text fw={700} size="sm">
                                                        {formatNumber(previewData.data.stats.followingCount || 0)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {t('forms.preview.following')}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                            <Center>
                                                <Stack gap={2} align="center">
                                                    <Text fw={700} size="sm">
                                                        {formatNumber(previewData.data.stats.heartCount || 0)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {t('forms.preview.likes')}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                            <Center>
                                                <Stack gap={2} align="center">
                                                    <Text fw={700} size="sm">
                                                        {formatNumber(previewData.data.stats.videoCount || 0)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {t('forms.preview.videos')}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                        </SimpleGrid>
                                    </Stack>
                                </Card>

                                <Group justify="space-between">
                                    <Button
                                        variant="light"
                                        color="gray"
                                        leftSection={<IconX size="1rem" />}
                                        onClick={handleCancelPreview}
                                    >
                                        {t('actions.cancel')}
                                    </Button>
                                    <Button
                                        color="#FE2C55"
                                        leftSection={<IconCheck size="1rem" />}
                                        loading={loading}
                                        onClick={handleConfirmConnect}
                                    >
                                        {t('actions.connectTiktok')}
                                    </Button>
                                </Group>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Card>
        );
    }

    return (
        <>
            <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group>
                            <IconBrandTiktok size={24} color="#FE2C55" />
                            <Text fw={600} size="lg">
                                {t('sections.tiktok')}
                            </Text>
                            <Badge color="green" variant="light">
                                {t('status.connected')}
                            </Badge>
                        </Group>
                        <Group>
                            <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={onUpdate}
                                loading={fetchingAvatar}
                            >
                                <IconRefresh size="1rem" />
                            </ActionIcon>
                            <Button
                                variant="light"
                                color="red"
                                leftSection={<IconUnlink size="1rem" />}
                                onClick={openDisconnect}
                                size="sm"
                            >
                                {t('actions.disconnectTiktok')}
                            </Button>
                        </Group>
                    </Group>

                    <Group>
                        <Avatar
                            src={tiktokAvatar}
                            size="lg"
                            radius="md"
                        >
                            {fetchingAvatar ? (
                                <Loader size="sm" />
                            ) : (
                                <IconBrandTiktok size="1.5rem" />
                            )}
                        </Avatar>
                        <div>
                            <Text fw={600} size="lg">
                                @{profile.tiktok_username}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {t('fields.lastActive')}: {new Date(profile.last_active_at).toLocaleDateString()}
                            </Text>
                        </div>
                    </Group>

                    {tiktokStats && (
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    {t('fields.followers')}
                                </Text>
                                <Text fw={600} size="lg">
                                    {formatNumber(tiktokStats.followerCount || 0)}
                                </Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    {t('fields.following')}
                                </Text>
                                <Text fw={600} size="lg">
                                    {formatNumber(tiktokStats.followingCount || 0)}
                                </Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    {t('fields.likes')}
                                </Text>
                                <Text fw={600} size="lg">
                                    {formatNumber(tiktokStats.heartCount || 0)}
                                </Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    {t('fields.videos')}
                                </Text>
                                <Text fw={600} size="lg">
                                    {formatNumber(tiktokStats.videoCount || 0)}
                                </Text>
                            </div>
                        </SimpleGrid>
                    )}
                </Stack>
            </Card>

            <Modal
                opened={disconnectOpened}
                onClose={closeDisconnect}
                title={t('modals.disconnect.title')}
                centered
            >
                <Stack gap="md">
                    <Text>
                        {t('modals.disconnect.message')}
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="light" onClick={closeDisconnect}>
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            color="red"
                            loading={loading}
                            onClick={handleDisconnect}
                        >
                            {t('actions.disconnectTiktok')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}