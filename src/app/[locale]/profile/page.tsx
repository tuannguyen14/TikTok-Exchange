// src/app/[locale]/profile/page.tsx
'use client';

import { Container, Stack, Title, Text, Loader, Alert, Group, ActionIcon } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/hooks/useProfile';
import ProfileStats from './components/ProfileStats';
import TikTokConnection from './components/TikTokConnection';
import ProfileSettings from './components/ProfileSettings';


export default function ProfilePage() {
    const t = useTranslations('Profile');
    const {
        profile,
        loading,
        error,
        refreshProfile,
        tiktokAvatar,
        fetchingAvatar
    } = useProfile();

    if (loading) {
        return (
            <Container size="lg" py="xl">
                <Stack align="center" gap="lg">
                    <Loader size="lg" color="#FE2C55" />
                    <Text size="lg" c="dimmed">
                        {t('messages.loading')}
                    </Text>
                </Stack>
            </Container>
        );
    }

    if (error || !profile) {
        return (
            <Container size="lg" py="xl">
                <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    title={t('common.error')}
                    color="red"
                >
                    {error || t('messages.updateError')}
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Title order={1} size="h1" fw={700} c="#FE2C55">
                            {t('title')}
                        </Title>
                        <Text size="lg" c="dimmed" mt="xs">
                            {t('subtitle')}
                        </Text>
                    </div>
                    <ActionIcon
                        variant="light"
                        color="#FE2C55"
                        size="lg"
                        onClick={refreshProfile}
                        loading={loading}
                    >
                        <IconRefresh size="1.2rem" />
                    </ActionIcon>
                </Group>

                {/* Account Information */}
                <div>
                    <Title order={2} size="h3" fw={600} mb="md">
                        {t('sections.account')}
                    </Title>
                    <ProfileStats profile={profile} />
                </div>

                {/* TikTok Connection */}
                <div>
                    <TikTokConnection
                        profile={profile}
                        tiktokAvatar={tiktokAvatar}
                        fetchingAvatar={fetchingAvatar}
                        onUpdate={refreshProfile}
                    />
                </div>

                {/* Settings */}
                <div>
                    <ProfileSettings
                        profile={profile}
                        onUpdate={refreshProfile}
                    />
                </div>
            </Stack>
        </Container>
    );
}