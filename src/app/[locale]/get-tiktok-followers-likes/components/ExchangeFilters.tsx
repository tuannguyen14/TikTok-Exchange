// components/exchange/ExchangeFilters.tsx

'use client';

import { Group, SegmentedControl, Select, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface ExchangeFiltersProps {
    campaignType: 'all' | 'video' | 'follow';
    onCampaignTypeChange: (type: 'all' | 'video' | 'follow') => void;
    status: 'all' | 'active' | 'completed';
    onStatusChange: (status: 'all' | 'active' | 'completed') => void;
    sortBy: 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits';
    onSortByChange: (sortBy: 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits') => void;
    onRefresh: () => void;
    loading?: boolean;
}

export default function ExchangeFilters({
    campaignType,
    onCampaignTypeChange,
    status,
    onStatusChange,
    sortBy,
    onSortByChange,
    onRefresh,
    loading = false
}: ExchangeFiltersProps) {
    const t = useTranslations('Exchange');

    const campaignTypeOptions = [
        { label: t('filters.all'), value: 'all' },
        { label: t('tabs.videos'), value: 'video' },
        { label: t('tabs.follows'), value: 'follow' }
    ];

    const statusOptions = [
        { label: t('filters.all'), value: 'all' },
        { label: t('filters.active'), value: 'active' },
        { label: t('filters.completed'), value: 'completed' }
    ];

    const sortOptions = [
        { label: t('filters.newest'), value: 'newest' },
        { label: t('filters.oldest'), value: 'oldest' },
        { label: t('filters.highestCredits'), value: 'highestCredits' },
        { label: t('filters.lowestCredits'), value: 'lowestCredits' }
    ];

    return (
        <Group justify="space-between" mb="md">
            <Group>
                <SegmentedControl
                    value={campaignType}
                    onChange={(value) => onCampaignTypeChange(value as 'all' | 'video' | 'follow')}
                    data={campaignTypeOptions}
                    size="sm"
                />

                <Select
                    value={status}
                    onChange={(value) => onStatusChange(value as 'all' | 'active' | 'completed')}
                    data={statusOptions}
                    size="sm"
                    w={140}
                />
            </Group>

            <Group>
                <Select
                    value={sortBy}
                    onChange={(value) => onSortByChange(value as 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits')}
                    data={sortOptions}
                    size="sm"
                    w={180}
                    label={t('filters.sortBy')}
                />

                <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconRefresh size={16} />}
                    onClick={onRefresh}
                    loading={loading}
                >
                    {t('empty.actionButton')}
                </Button>
            </Group>
        </Group>
    );
}