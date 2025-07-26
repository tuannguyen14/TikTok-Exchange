// src/app/[locale]/profile/page.tsx
'use client';

import { Container, Stack, Title, Text, Loader, Alert, Group, Box, Paper, BackgroundImage, Avatar, Badge, Center } from '@mantine/core';
import { IconAlertCircle, IconSparkles, IconTrendingUp } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/hooks/useProfile';
import ProfileStats from './components/ProfileStats';
import TikTokConnection from './components/TikTokConnection';
import ProfileSettings from './components/ProfileSettings';
import classes from './Profile.module.css';

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
            <Box className={classes.loadingContainer}>
                <Stack align="center" gap="lg">
                    <div className={classes.loaderWrapper}>
                        <Loader size="xl" color="#FE2C55" />
                    </div>
                    <Text size="lg" c="dimmed" className={classes.loadingText}>
                        {t('messages.loading')}
                    </Text>
                </Stack>
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Container size="lg" py="xl">
                <Alert
                    icon={<IconAlertCircle size="1.5rem" />}
                    title={t('common.error')}
                    color="red"
                    radius="md"
                    variant="filled"
                    className={classes.errorAlert}
                >
                    {error || t('messages.updateError')}
                </Alert>
            </Container>
        );
    }

    return (
        <Box className={classes.pageWrapper}>
            {/* Hero Section with Gradient Background */}
            <Box className={classes.heroSection}>
                <Container size="lg">
                    <Stack gap={0} align="center" className={classes.heroContent}>
                        {/* Avatar with Glow Effect */}
                        <Box className={classes.avatarContainer}>
                            <Avatar
                                src={tiktokAvatar}
                                size={210}
                                radius="xl"
                                className={classes.profileAvatar}
                            >
                                {profile.email.charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>

                        {/* User Info */}
                        <Title order={1} className={classes.userName}>
                            {profile.tiktok_username ? `@${profile.tiktok_username}` : profile.email.split('@')[0]}
                        </Title>
                        <Text size="lg" c="dimmed" className={classes.userEmail}>
                            {profile.email}
                        </Text>

                        {/* Quick Stats */}
                        <Group gap="sm" className={classes.quickStats}>
                            <Box className={classes.statItem}>
                                <Text size="1rem" fw={700} className={classes.statNumber}>
                                    {profile.credits.toLocaleString()}
                                </Text>
                                <Text size="sm" c="dimmed">Credits</Text>
                            </Box>
                            <Box className={classes.statDivider} />
                            <Box className={classes.statItem}>
                                <Text size="1rem" fw={700} className={classes.statNumber}>
                                    {profile.total_earned.toLocaleString()}
                                </Text>
                                <Text size="sm" c="dimmed">Earned</Text>
                            </Box>
                            <Box className={classes.statDivider} />
                            <Box className={classes.statItem}>
                                <Group gap={4} align="center">
                                    <IconTrendingUp size={18} className={classes.trendIcon} />
                                    <Text size="1rem" fw={700} className={classes.statNumber}>
                                        {((profile.total_earned / (profile.total_spent || 1)) * 100).toFixed(0)}%
                                    </Text>
                                </Group>
                                <Text size="sm" c="dimmed">ROI</Text>
                            </Box>
                        </Group>
                    </Stack>
                </Container>
            </Box>

            {/* Main Content */}
            <Container size="lg" className={classes.mainContent}>
                <Stack gap="2rem">
                    {/* Detailed Stats Section */}
                    <Paper className={classes.sectionCard}>
                        <Group mb="lg" className={classes.sectionHeader}>
                            <Box className={classes.sectionIcon}>
                                <IconSparkles size={20} />
                            </Box>
                            <Text fw={600} size="xl" className={classes.sectionTitle}>
                                {t('sections.account')}
                            </Text>
                        </Group>
                        <ProfileStats profile={profile} />
                    </Paper>

                    {/* TikTok Connection Section */}
                    <Box className={classes.tiktokSection}>
                        <TikTokConnection
                            profile={profile}
                            tiktokAvatar={tiktokAvatar}
                            fetchingAvatar={fetchingAvatar}
                            onUpdate={refreshProfile}
                        />
                    </Box>

                    {/* Settings Section */}
                    <Box className={classes.settingsSection}>
                        <ProfileSettings
                            profile={profile}
                            onUpdate={refreshProfile}
                        />
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}