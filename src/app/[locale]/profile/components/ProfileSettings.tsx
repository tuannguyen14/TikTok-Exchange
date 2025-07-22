// src/components/profile/ProfileSettings.tsx
'use client';

import { useState } from 'react';
import {
    Card,
    Group,
    Text,
    Switch,
    Button,
    Stack,
    Divider,
    Box,
    Badge,
    Transition,
    Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconSettings,
    IconDeviceFloppy,
    IconBell,
    IconMail,
    IconTrophy,
    IconSpeakerphone,
    IconCheck,
    IconSparkles
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile, NotificationSettings } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';
import classes from './ProfileSettings.module.css';

interface ProfileSettingsProps {
    profile: Profile;
    onUpdate: () => void;
}

export default function ProfileSettings({ profile, onUpdate }: ProfileSettingsProps) {
    const t = useTranslations('Profile');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>(
        profile.notification_settings || {
            email: true,
            push: true,
            campaigns: true,
            rewards: true,
        }
    );
    const { updateProfile } = useProfile();

    const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ notification_settings: settings });
            notifications.show({
                title: t('common.success'),
                message: t('messages.updateSuccess'),
                color: 'green',
                icon: <IconCheck size="1rem" />,
            });
            onUpdate();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error instanceof Error ? error.message : t('messages.updateError'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(profile.notification_settings);

    const settingsOptions = [
        {
            key: 'email' as keyof NotificationSettings,
            icon: IconMail,
            color: '#FE2C55',
            title: t('notifications.email'),
            description: t('notifications.emailDescription'),
            badge: 'Important',
            badgeColor: 'red',
        },
        {
            key: 'push' as keyof NotificationSettings,
            icon: IconBell,
            color: '#25F4EE',
            title: t('notifications.push'),
            description: t('notifications.pushDescription'),
            badge: 'Real-time',
            badgeColor: 'blue',
        },
        {
            key: 'campaigns' as keyof NotificationSettings,
            icon: IconSpeakerphone,
            color: '#764ba2',
            title: t('notifications.campaigns'),
            description: t('notifications.campaignsDescription'),
            badge: 'Updates',
            badgeColor: 'violet',
        },
        {
            key: 'rewards' as keyof NotificationSettings,
            icon: IconTrophy,
            color: '#00C5DC',
            title: t('notifications.rewards'),
            description: t('notifications.rewardsDescription'),
            badge: 'Exciting',
            badgeColor: 'green',
        },
    ];

    return (
        <Card padding={0} radius="xl" className={classes.settingsCard}>
            {/* Header */}
            <Box className={classes.cardHeader}>
                <Group>
                    <Box className={classes.settingsIcon}>
                        <IconSettings size={24} />
                    </Box>
                    <Text fw={700} size="xl" c="white">
                        {t('sections.settings')}
                    </Text>
                    <Badge
                        variant="light"
                        color="white"
                        size="lg"
                        className={classes.headerBadge}
                    >
                        <IconSparkles size={14} />
                    </Badge>
                </Group>
            </Box>

            {/* Content */}
            <Box p="xl">
                <Stack gap="lg">
                    <Text size="md" c="dimmed" mb="xs">
                        {/* {t('settings.description')} */}
                    </Text>

                    <Stack gap="md">
                        {settingsOptions.map((option, index) => (
                            <Paper
                                key={option.key}
                                className={classes.settingItem}
                                p="lg"
                                radius="lg"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Group justify="space-between" align="flex-start">
                                    <Group align="flex-start" style={{ flex: 1 }}>
                                        <Box
                                            className={classes.iconBox}
                                            style={{ backgroundColor: `${option.color}20` }}
                                        >
                                            <option.icon size={24} color={option.color} />
                                        </Box>
                                        <Box style={{ flex: 1 }}>
                                            <Group gap="xs" mb={4}>
                                                <Text fw={600} size="md">
                                                    {option.title}
                                                </Text>
                                                <Badge
                                                    size="sm"
                                                    variant="light"
                                                    color={option.badgeColor}
                                                    className={classes.settingBadge}
                                                >
                                                    {option.badge}
                                                </Badge>
                                            </Group>
                                            <Text size="sm" c="dimmed">
                                                {option.description}
                                            </Text>
                                        </Box>
                                    </Group>
                                    <Switch
                                        size="lg"
                                        color={option.color}
                                        checked={settings[option.key]}
                                        onChange={(event) => handleSettingChange(option.key, event.currentTarget.checked)}
                                        classNames={{
                                            track: classes.switchTrack,
                                            thumb: classes.switchThumb,
                                        }}
                                    />
                                </Group>
                            </Paper>
                        ))}
                    </Stack>

                    {/* Save Button */}
                    <Transition
                        mounted={hasChanges}
                        transition="slide-up"
                        duration={400}
                        timingFunction="ease"
                    >
                        {(styles) => (
                            <Box style={styles}>
                                <Divider my="lg" />
                                <Group justify="space-between" align="center">
                                    <Group gap="xs">
                                        <Box className={classes.changesIndicator}>
                                            <IconSparkles size={16} />
                                        </Box>
                                        <Text size="sm" c="dimmed" fw={500}>
                                            You have unsaved changes
                                        </Text>
                                    </Group>
                                    <Button
                                        leftSection={<IconDeviceFloppy size="1.2rem" />}
                                        loading={loading}
                                        onClick={handleSave}
                                        size="lg"
                                        radius="md"
                                        className={classes.saveButton}
                                    >
                                        {t('actions.save')}
                                    </Button>
                                </Group>
                            </Box>
                        )}
                    </Transition>
                </Stack>
            </Box>
        </Card>
    );
}