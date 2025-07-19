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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSettings, IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile, NotificationSettings } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';

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

    return (
        <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group>
                    <IconSettings size={24} color="#666" />
                    <Text fw={600} size="lg">
                        {t('sections.settings')}
                    </Text>
                </Group>

                <Divider />

                <Stack gap="md">
                    <Text fw={500} size="md">
                        {t('notifications.email')}
                    </Text>

                    <Switch
                        label={t('notifications.email')}
                        description={t('notifications.emailDescription')}
                        checked={settings.email}
                        onChange={(event) => handleSettingChange('email', event.currentTarget.checked)}
                    />

                    <Switch
                        label={t('notifications.push')}
                        description={t('notifications.pushDescription')}
                        checked={settings.push}
                        onChange={(event) => handleSettingChange('push', event.currentTarget.checked)}
                    />

                    <Switch
                        label={t('notifications.campaigns')}
                        description={t('notifications.campaignsDescription')}
                        checked={settings.campaigns}
                        onChange={(event) => handleSettingChange('campaigns', event.currentTarget.checked)}
                    />

                    <Switch
                        label={t('notifications.rewards')}
                        description={t('notifications.rewardsDescription')}
                        checked={settings.rewards}
                        onChange={(event) => handleSettingChange('rewards', event.currentTarget.checked)}
                    />
                </Stack>

                {hasChanges && (
                    <>
                        <Divider />
                        <Group justify="flex-end">
                            <Button
                                leftSection={<IconDeviceFloppy size="1rem" />}
                                loading={loading}
                                onClick={handleSave}
                                color="#FE2C55"
                            >
                                {t('actions.save')}
                            </Button>
                        </Group>
                    </>
                )}
            </Stack>
        </Card>
    );
}