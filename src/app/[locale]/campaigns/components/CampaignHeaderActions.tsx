// src/app/[locale]/campaigns/components/CampaignHeaderActions.tsx
'use client';

import { memo } from 'react';
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

const CampaignHeaderActions = memo(({
  activeTab,
  loading,
  onTabChange,
  onRefresh,
  onCreateCampaign,
  translations
}: CampaignHeaderActionsProps) => {
  return (
    <Group justify="space-between" wrap="wrap">
      <SegmentedControl
        value={activeTab}
        onChange={onTabChange}
        data={[
          { label: translations.tabs.all, value: 'all' },
          { label: translations.tabs.video, value: 'video' },
          { label: translations.tabs.follow, value: 'follow' },
        ]}
      />
      
      <Group gap="xs">
        <ActionIcon
          variant="default"
          onClick={onRefresh}
          loading={loading}
          size="lg"
        >
          <IconRefresh size={16} />
        </ActionIcon>
        
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateCampaign}
          gradient={{ from: 'pink', to: 'red' }}
          variant="gradient"
        >
          {translations.buttons.createCampaign}
        </Button>
      </Group>
    </Group>
  );
});

CampaignHeaderActions.displayName = 'CampaignHeaderActions';

export default CampaignHeaderActions;