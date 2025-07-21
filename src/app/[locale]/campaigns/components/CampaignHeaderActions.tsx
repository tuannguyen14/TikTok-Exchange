// src/app/[locale]/campaigns/components/CampaignHeaderActions.tsx
'use client';

import { memo, useMemo } from 'react';
import { Group, SegmentedControl, ActionIcon, Button } from '@mantine/core';
import { IconRefresh, IconPlus } from '@tabler/icons-react';

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

// Memoized refresh button
const RefreshButton = memo(({ 
  loading, 
  onRefresh 
}: { 
  loading: boolean; 
  onRefresh: () => void; 
}) => (
  <ActionIcon
    variant="default"
    onClick={onRefresh}
    loading={loading}
    size="lg"
    style={{ transition: 'all 200ms ease' }}
    aria-label="Làm mới dữ liệu"
    onMouseEnter={(e) => {
      if (!loading) {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
        e.currentTarget.style.transform = 'rotate(90deg)';
      }
    }}
    onMouseLeave={(e) => {
      if (!loading) {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.transform = '';
      }
    }}
  >
    <IconRefresh size={16} />
  </ActionIcon>
));
RefreshButton.displayName = 'RefreshButton';

// Memoized create button
const CreateButton = memo(({ 
  onCreateCampaign, 
  text 
}: { 
  onCreateCampaign: () => void; 
  text: string; 
}) => (
  <Button
    leftSection={<IconPlus size={16} />}
    onClick={onCreateCampaign}
    gradient={{ from: 'pink', to: 'red' }}
    variant="gradient"
    size="md"
    radius="md"
    style={{
      fontWeight: 600,
      transition: 'all 200ms ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
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
  
  // Memoize segmented control data to prevent recreating on every render
  const segmentedData = useMemo(() => [
    { label: translations.tabs.all, value: 'all' },
    { label: translations.tabs.video, value: 'video' },
    { label: translations.tabs.follow, value: 'follow' },
  ], [translations.tabs]);

  return (
    <Group justify="space-between" wrap="wrap" gap="md">
      <SegmentedControl
        value={activeTab}
        onChange={onTabChange}
        data={segmentedData}
        size="md"
        style={{
          backgroundColor: 'var(--mantine-color-gray-1)',
          padding: '4px',
          borderRadius: 'var(--mantine-radius-md)'
        }}
      />
      
      <Group gap="sm">
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
  );
});

CampaignHeaderActions.displayName = 'CampaignHeaderActions';

export default CampaignHeaderActions;