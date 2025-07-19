// src/components/profile/ProfileStats.tsx
'use client';

import { Card, Group, Text, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconCoins, IconTrendingUp, IconTrendingDown, IconClock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile } from '@/types/profile';

interface ProfileStatsProps {
    profile: Profile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
    const t = useTranslations('Profile');

    const stats = [
        {
            title: t('fields.credits'),
            value: profile.credits.toLocaleString(),
            icon: IconCoins,
            color: '#FE2C55',
        },
        {
            title: t('fields.totalEarned'),
            value: profile.total_earned.toLocaleString(),
            icon: IconTrendingUp,
            color: '#25F4EE',
        },
        {
            title: t('fields.totalSpent'),
            value: profile.total_spent.toLocaleString(),
            icon: IconTrendingDown,
            color: '#EE1D52',
        },
        {
            title: t('fields.memberSince'),
            value: new Date(profile.created_at).toLocaleDateString(),
            icon: IconClock,
            color: '#666',
        },
    ];

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {stats.map((stat, index) => (
                <Card key={index} padding="lg" radius="md" withBorder>
                    <Group>
                        <ThemeIcon
                            size={40}
                            radius="md"
                            style={{ backgroundColor: stat.color }}
                        >
                            <stat.icon size="1.2rem" stroke={1.5} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                {stat.title}
                            </Text>
                            <Text fw={700} size="xl">
                                {stat.value}
                            </Text>
                        </div>
                    </Group>
                </Card>
            ))}
        </SimpleGrid>
    );
}