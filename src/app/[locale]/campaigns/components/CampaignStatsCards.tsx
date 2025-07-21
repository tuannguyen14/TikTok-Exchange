// src/app/[locale]/campaigns/components/CampaignStatsCards.tsx
'use client';

import { memo, useMemo } from 'react';
import { Card, Group, Text, ThemeIcon, SimpleGrid, rem } from '@mantine/core';
import {
  IconTrendingUp,
  IconActivity,
  IconCreditCard,
  IconUsers
} from '@tabler/icons-react';

interface CampaignStatsCardsProps {
  stats: {
    total: number;
    active: number;
    totalCreditsSpent: number;
    totalActionsReceived: number;
  };
  translations: {
    total: string;
    active: string;
    creditsSpent: string;
    actionsReceived: string;
  };
}

// Memoized individual stat card component
const StatCard = memo(({
  value,
  label,
  color,
  icon: Icon
}: {
  value: string | number;
  label: string;
  color: string;
  icon: React.ComponentType<any>;
}) => (
  <Card
    withBorder
    radius="md"
    p="md"
    style={{
      transition: 'all 200ms ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '';
      e.currentTarget.style.transform = '';
    }}
  >
    <Group justify="space-between" wrap="nowrap">
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          c="gray.6"
          size="sm"
          fw={600}
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </Text>
        <Text
          fw={700}
          size="xl"
          c="gray.9"
          style={{
            lineHeight: 1.2,
            marginTop: '4px',
            fontFeatureSettings: '"tnum"' // Tabular numbers for better alignment
          }}
        >
          {value}
        </Text>
      </div>
      <ThemeIcon
        color={color}
        variant="light"
        size="lg"
        style={{ flexShrink: 0 }}
      >
        <Icon style={{ width: rem(18), height: rem(18) }} />
      </ThemeIcon>
    </Group>
  </Card>
));
StatCard.displayName = 'StatCard';

const CampaignStatsCards = memo(({ stats, translations }: CampaignStatsCardsProps) => {
  // Memoize formatted values to prevent recalculation on every render
  const formattedStats = useMemo(() => ({
    total: stats.total.toLocaleString(),
    active: stats.active.toLocaleString(),
    creditsSpent: stats.totalCreditsSpent.toLocaleString(),
    actionsReceived: stats.totalActionsReceived.toLocaleString()
  }), [stats]);

  // Memoize stat cards configuration
  const statCards = useMemo(() => [
    {
      value: formattedStats.total,
      label: translations.total,
      color: 'blue',
      icon: IconTrendingUp
    },
    {
      value: formattedStats.active,
      label: translations.active,
      color: 'green',
      icon: IconActivity
    },
    {
      value: formattedStats.creditsSpent,
      label: translations.creditsSpent,
      color: 'violet',
      icon: IconCreditCard
    },
    {
      value: formattedStats.actionsReceived,
      label: translations.actionsReceived,
      color: 'orange',
      icon: IconUsers
    }
  ], [formattedStats, translations]);

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 4 }}
      spacing="md"
    >
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          color={stat.color}
          icon={stat.icon}
        />
      ))}
    </SimpleGrid>
  );
});

CampaignStatsCards.displayName = 'CampaignStatsCards';

export default CampaignStatsCards;