// src/app/[locale]/campaigns/components/CampaignDeleteModal.tsx
'use client';

import { memo } from 'react';
import { Modal, Stack, Text, Group, Button } from '@mantine/core';

interface CampaignDeleteModalProps {
  opened: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  translations: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
  };
}

const CampaignDeleteModal = memo(({ 
  opened, 
  loading, 
  onClose, 
  onConfirm, 
  translations 
}: CampaignDeleteModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={translations.title}
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {translations.description}
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={onClose}
            disabled={loading}
          >
            {translations.cancel}
          </Button>
          <Button
            color="red"
            onClick={onConfirm}
            loading={loading}
          >
            {translations.confirm}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
});

CampaignDeleteModal.displayName = 'CampaignDeleteModal';

export default CampaignDeleteModal;