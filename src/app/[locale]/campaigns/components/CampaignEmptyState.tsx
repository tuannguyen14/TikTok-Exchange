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
    <Center py={80}>
      <Stack align="center" gap="lg" maw={400}>
        <ThemeIcon 
          size={80} 
          variant="light" 
          color="gray"
          style={{
            backgroundColor: 'var(--mantine-color-gray-1)',
            color: 'var(--mantine-color-gray-5)'
          }}
        >
          <IconVideo size={40} />
        </ThemeIcon>

        <Stack align="center" gap="sm" ta="center">
          <Text 
            size="xl" 
            fw={600}
            c="gray.8"
            style={{ lineHeight: 1.3 }}
          >
            {translations.title}
          </Text>
          <Text 
            size="md" 
            c="gray.6" 
            ta="center"
            lh={1.5}
            maw={320}
          >
            {translations.description}
          </Text>
        </Stack>

        <Button
          onClick={onCreateCampaign}
          gradient={{ from: 'pink', to: 'red' }}
          variant="gradient"
          size="md"
          radius="md"
          style={{
            minWidth: 160,
            height: 42,
            fontWeight: 600,
            marginTop: '8px',
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
          {translations.action}
        </Button>
      </Stack>
    </Center>
  );
});

CampaignEmptyState.displayName = 'CampaignEmptyState';

export default CampaignEmptyState;