// src/app/[locale]/campaigns/components/CampaignStatsCards.tsx
'use client';

import { memo } from 'react';
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

const CampaignStatsCards = memo(({ stats, translations }: CampaignStatsCardsProps) => {
  const statCards = [
    {
      value: stats.total,
      label: translations.total,
      color: 'blue',
      icon: IconTrendingUp
    },
    {
      value: stats.active,
      label: translations.active,
      color: 'green',
      icon: IconActivity
    },
    {
      value: stats.totalCreditsSpent.toLocaleString(),
      label: translations.creditsSpent,
      color: 'violet',
      icon: IconCreditCard
    },
    {
      value: stats.totalActionsReceived.toLocaleString(),
      label: translations.actionsReceived,
      color: 'orange',
      icon: IconUsers
    }
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      {statCards.map((stat, index) => (
        <Card key={index} withBorder radius="md" p="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                {stat.label}
              </Text>
              <Text fw={700} size="xl">
                {stat.value}
              </Text>
            </div>
            <ThemeIcon color={stat.color} variant="light" size="lg">
              <stat.icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
});

CampaignStatsCards.displayName = 'CampaignStatsCards';

export default CampaignStatsCards;