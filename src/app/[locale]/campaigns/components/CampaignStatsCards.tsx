// src/app/[locale]/campaigns/components/CampaignStatsCards.tsx
'use client';

import { memo, useMemo } from 'react';
import { Card, Group, Text, ThemeIcon, SimpleGrid, rem, Box, Stack } from '@mantine/core';
import {
  IconTrendingUp,
  IconActivity,
  IconCreditCard,
  IconUsers,
  IconArrowUpRight,
  IconArrowDownRight
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

// Memoized individual stat card component with enhanced design
const StatCard = memo(({
  value,
  label,
  color,
  icon: Icon,
  trend,
  gradient
}: {
  value: string | number;
  label: string;
  color: string;
  icon: React.ComponentType<any>;
  trend?: { value: number; isPositive: boolean };
  gradient: { from: string; to: string };
}) => (
  <Card
    withBorder
    radius="lg"
    p="xl"
    style={{
      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      borderColor: 'transparent',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      overflow: 'hidden',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }}
  >
    {/* Background decoration */}
    <Box
      style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '150%',
        height: '150%',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}
    />
    
    <Stack gap="md" style={{ position: 'relative', zIndex: 1 }}>
      <Group justify="space-between" align="flex-start">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="white"
          color={color}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Icon style={{ width: rem(28), height: rem(28) }} stroke={1.5} />
        </ThemeIcon>
        
        {trend && (
          <Group gap={4} style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(10px)',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            {trend.isPositive ? (
              <IconArrowUpRight size={16} color="white" />
            ) : (
              <IconArrowDownRight size={16} color="white" />
            )}
            <Text size="xs" fw={700} c="white">
              {trend.value}%
            </Text>
          </Group>
        )}
      </Group>
      
      <div>
        <Text
          size="xs"
          fw={600}
          tt="uppercase"
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}
        >
          {label}
        </Text>
        <Text
          fw={800}
          size={rem(32)}
          style={{
            color: 'white',
            lineHeight: 1,
            fontFeatureSettings: '"tnum"',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {value}
        </Text>
      </div>
    </Stack>
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

  // Memoize stat cards configuration with gradients and trends
  const statCards = useMemo(() => [
    {
      value: formattedStats.total,
      label: translations.total,
      color: 'blue',
      icon: IconTrendingUp,
      gradient: { from: '#667eea', to: '#764ba2' },
      trend: { value: 12, isPositive: true }
    },
    {
      value: formattedStats.active,
      label: translations.active,
      color: 'green',
      icon: IconActivity,
      gradient: { from: '#f093fb', to: '#f5576c' },
      trend: { value: 8, isPositive: true }
    },
    {
      value: formattedStats.creditsSpent,
      label: translations.creditsSpent,
      color: 'violet',
      icon: IconCreditCard,
      gradient: { from: '#4facfe', to: '#00f2fe' },
      trend: { value: 23, isPositive: false }
    },
    {
      value: formattedStats.actionsReceived,
      label: translations.actionsReceived,
      color: 'orange',
      icon: IconUsers,
      gradient: { from: '#fa709a', to: '#fee140' },
      trend: { value: 45, isPositive: true }
    }
  ], [formattedStats, translations]);

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 4 }}
      spacing="xl"
    >
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          color={stat.color}
          icon={stat.icon}
          gradient={stat.gradient}
          trend={stat.trend}
        />
      ))}
    </SimpleGrid>
  );
});

CampaignStatsCards.displayName = 'CampaignStatsCards';

export default CampaignStatsCards;