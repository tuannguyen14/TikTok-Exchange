// src/app/[locale]/campaigns/components/CampaignHeaderActions.tsx
'use client';

import { memo, useMemo } from 'react';
import { Group, SegmentedControl, ActionIcon, Button, Box, Text } from '@mantine/core';
import { IconRefresh, IconPlus, IconFilter, IconVideo, IconUserPlus, IconGridDots } from '@tabler/icons-react';

interface CampaignHeaderActionsProps {
  activeTab: 'all' | 'video' | 'follow';
  loading: boolean;
  onTabChange: (value: string) => void;
  onRefresh: () => void;
  onCreateCampaign: () => void;
  translations: {
    tabs: {
      all: string;
      video: string;
      follow: string;
    };
    buttons: {
      createCampaign: string;
    };
  };
}

// Memoized refresh button with enhanced design
const RefreshButton = memo(({
  loading,
  onRefresh
}: {
  loading: boolean;
  onRefresh: () => void;
}) => (
  <ActionIcon
    variant="light"
    onClick={onRefresh}
    loading={loading}
    size={42}
    radius="xl"
    style={{
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'var(--mantine-color-gray-0)',
      border: '1px solid var(--mantine-color-gray-2)'
    }}
    aria-label="Làm mới dữ liệu"
    onMouseEnter={(e) => {
      if (!loading) {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
        e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }
    }}
    onMouseLeave={(e) => {
      if (!loading) {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }
    }}
  >
    <IconRefresh size={20} stroke={1.5} />
  </ActionIcon>
));
RefreshButton.displayName = 'RefreshButton';

// Memoized filter button
const FilterButton = memo(() => (
  <ActionIcon
    variant="light"
    size={42}
    radius="xl"
    style={{
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'var(--mantine-color-gray-0)',
      border: '1px solid var(--mantine-color-gray-2)'
    }}
    aria-label="Lọc chiến dịch"
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }}
  >
    <IconFilter size={20} stroke={1.5} />
  </ActionIcon>
));
FilterButton.displayName = 'FilterButton';

// Memoized create button with enhanced design
const CreateButton = memo(({
  onCreateCampaign,
  text
}: {
  onCreateCampaign: () => void;
  text: string;
}) => (
  <Button
    leftSection={<IconPlus size={18} stroke={2} />}
    onClick={onCreateCampaign}
    size="md"
    radius="xl"
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      fontWeight: 600,
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      paddingLeft: '24px',
      paddingRight: '24px',
      height: '42px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    }}
  >
    {text}
  </Button>
));
CreateButton.displayName = 'CreateButton';

const CampaignHeaderActions = memo(({
  activeTab,
  loading,
  onTabChange,
  onRefresh,
  onCreateCampaign,
  translations
}: CampaignHeaderActionsProps) => {

  // Memoize segmented control data with icons
  const segmentedData = useMemo(() => [
    {
      label: (
        <Group gap={6} wrap="nowrap">
          <IconGridDots size={16} />
          <Text size="sm" fw={600}>{translations.tabs.all}</Text>
        </Group>
      ),
      value: 'all'
    },
    {
      label: (
        <Group gap={6} wrap="nowrap">
          <IconVideo size={16} />
          <Text size="sm" fw={600}>{translations.tabs.video}</Text>
        </Group>
      ),
      value: 'video'
    },
    {
      label: (
        <Group gap={6} wrap="nowrap">
          <IconUserPlus size={16} />
          <Text size="sm" fw={600}>{translations.tabs.follow}</Text>
        </Group>
      ),
      value: 'follow'
    },
  ], [translations.tabs]);

  return (
    <Box>
      <Group justify="space-between" wrap="wrap" gap="md">
        <SegmentedControl
          value={activeTab}
          onChange={onTabChange}
          data={segmentedData}
          size="md"
          radius="xl"
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            border: '1px solid var(--mantine-color-gray-2)',
            padding: '4px',
          }}
          styles={{
            indicator: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              borderRadius: 'var(--mantine-radius-xl)'
            },
            label: {
              padding: '8px 16px',
              transition: 'all 200ms ease',
              '&[dataActive="true"]': {
                color: 'white',
                '& svg': {
                  color: 'white'
                }
              },
              '&:not([dataActive="true"])': {
                '&:hover': {
                  color: 'var(--mantine-color-violet-6)'
                }
              }
            }
          }}
        />

        <Group gap="sm">
          <FilterButton />
          <RefreshButton
            loading={loading}
            onRefresh={onRefresh}
          />

          <CreateButton
            onCreateCampaign={onCreateCampaign}
            text={translations.buttons.createCampaign}
          />
        </Group>
      </Group>
    </Box>
  );
});

CampaignHeaderActions.displayName = 'CampaignHeaderActions';

export default CampaignHeaderActions;