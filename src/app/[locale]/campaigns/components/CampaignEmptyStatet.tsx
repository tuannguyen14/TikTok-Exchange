// src/app/[locale]/campaigns/components/CampaignEmptyState.tsx
'use client';

import { memo } from 'react';
import { Stack, Text, Button, Center, ThemeIcon } from '@mantine/core';
import { IconVideo } from '@tabler/icons-react';

interface CampaignEmptyStateProps {
  onCreateCampaign: () => void;
  translations: {
    title: string;
    description: string;
    action: string;
  };
}

const CampaignEmptyState = memo(({ onCreateCampaign, translations }: CampaignEmptyStateProps) => {
  return (
    <Center py={60}>
      <Stack align="center" gap="md">
        <ThemeIcon size={64} variant="light" color="gray">
          <IconVideo size={32} />
        </ThemeIcon>
        
        <Stack align="center" gap="xs">
          <Text size="lg" fw={500}>
            {translations.title}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {translations.description}
          </Text>
        </Stack>
        
        <Button
          onClick={onCreateCampaign}
          gradient={{ from: 'pink', to: 'red' }}
          variant="gradient"
          size="sm"
        >
          {translations.action}
        </Button>
      </Stack>
    </Center>
  );
});

CampaignEmptyState.displayName = 'CampaignEmptyState';

export default CampaignEmptyState;