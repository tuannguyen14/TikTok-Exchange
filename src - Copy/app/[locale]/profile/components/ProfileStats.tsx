// src/components/profile/ProfileStats.tsx
'use client';

import { Card, Group, Text, ThemeIcon, SimpleGrid, Box, Progress, Tooltip } from '@mantine/core';
import { IconCoins, IconTrendingUp, IconTrendingDown, IconClock, IconSparkles } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Profile } from '@/types/profile';
import classes from './ProfileStats.module.css';

interface ProfileStatsProps {
    profile: Profile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
    const t = useTranslations('Profile');

    const calculateProgress = (current: number, total: number) => {
        if (total === 0) return 0;
        return Math.min((current / total) * 100, 100);
    };

    const stats = [
        {
            title: t('fields.credits'),
            value: profile.credits.toLocaleString(),
            icon: IconCoins,
            color: '#FE2C55',
            gradient: { from: '#FE2C55', to: '#EE1D52' },
            description: 'Available credits for campaigns',
            progress: calculateProgress(profile.credits, profile.total_earned),
            trend: '+12%',
            trendUp: true,
        },
        {
            title: t('fields.totalEarned'),
            value: profile.total_earned.toLocaleString(),
            icon: IconTrendingUp,
            color: '#25F4EE',
            gradient: { from: '#25F4EE', to: '#00C5DC' },
            description: 'Total earnings from campaigns',
            progress: 100,
            trend: '+24%',
            trendUp: true,
        },
        {
            title: t('fields.totalSpent'),
            value: profile.total_spent.toLocaleString(),
            icon: IconTrendingDown,
            color: '#EE1D52',
            gradient: { from: '#EE1D52', to: '#FE2C55' },
            description: 'Credits spent on campaigns',
            progress: calculateProgress(profile.total_spent, profile.total_earned),
            trend: '-8%',
            trendUp: false,
        },
        {
            title: t('fields.memberSince'),
            value: new Date(profile.created_at).toLocaleDateString(),
            icon: IconClock,
            color: '#666',
            gradient: { from: '#667eea', to: '#764ba2' },
            description: 'Account creation date',
            special: true,
            daysActive: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        },
    ];

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {stats.map((stat, index) => (
                <Card 
                    key={index} 
                    padding="lg" 
                    radius="xl" 
                    className={classes.statCard}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <Box className={classes.cardContent}>
                        {/* Icon and Trend */}
                        <Group justify="space-between" mb="md">
                            <Box className={classes.iconWrapper} style={{ background: `linear-gradient(135deg, ${stat.gradient.from}, ${stat.gradient.to})` }}>
                                <stat.icon size="1.5rem" stroke={1.5} />
                            </Box>
                            {stat.trend && (
                                <Box className={`${classes.trendBadge} ${stat.trendUp ? classes.trendUp : classes.trendDown}`}>
                                    <Text size="xs" fw={700}>
                                        {stat.trend}
                                    </Text>
                                </Box>
                            )}
                        </Group>

                        {/* Title */}
                        <Text size="xs" c="dimmed" fw={600} tt="uppercase" className={classes.statTitle}>
                            {stat.title}
                        </Text>

                        {/* Value */}
                        <Text fw={800} size="2rem" className={classes.statValue}>
                            {stat.value}
                        </Text>

                        {/* Special content for member since */}
                        {stat.special && stat.daysActive !== undefined && (
                            <Group gap="xs" mt="xs">
                                <IconSparkles size={14} className={classes.sparkleIcon} />
                                <Text size="xs" c="dimmed">
                                    {stat.daysActive} days active
                                </Text>
                            </Group>
                        )}

                        {/* Progress bar for other stats */}
                        {!stat.special && stat.progress !== undefined && (
                            <Tooltip label={stat.description} position="bottom">
                                <Progress
                                    value={stat.progress}
                                    color={stat.gradient.from}
                                    size="sm"
                                    radius="xl"
                                    mt="md"
                                    className={classes.progressBar}
                                />
                            </Tooltip>
                        )}

                        {/* Hover description */}
                        <Text size="xs" c="dimmed" className={classes.description}>
                            {stat.description}
                        </Text>
                    </Box>

                    {/* Background decoration */}
                    <Box className={classes.bgDecoration} />
                </Card>
            ))}
        </SimpleGrid>
    );
}