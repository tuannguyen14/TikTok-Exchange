// src/app/[locale]/campaigns/components/CampaignDeleteModal.tsx
'use client';

import { memo } from 'react';
import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

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

// Memoized action buttons
const ModalActions = memo(({ 
  loading, 
  onClose, 
  onConfirm, 
  cancelText, 
  confirmText 
}: {
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelText: string;
  confirmText: string;
}) => (
  <Group justify="flex-end" gap="sm" mt="md">
    <Button
      variant="default"
      onClick={onClose}
      disabled={loading}
      size="md"
      style={{
        fontWeight: 500,
        minWidth: 80
      }}
    >
      {cancelText}
    </Button>
    <Button
      color="red"
      onClick={onConfirm}
      loading={loading}
      size="md"
      style={{
        fontWeight: 600,
        minWidth: 80
      }}
    >
      {confirmText}
    </Button>
  </Group>
));
ModalActions.displayName = 'ModalActions';

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
      title={
        <Group gap="xs" c="red.7">
          <IconAlertTriangle size={20} />
          <Text fw={600} size="lg">
            {translations.title}
          </Text>
        </Group>
      }
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      size="md"
      radius="md"
    >
      <Stack gap="lg">
        <Text 
          size="md" 
          c="gray.7"
          lh={1.5}
        >
          {translations.description}
        </Text>
        
        <ModalActions
          loading={loading}
          onClose={onClose}
          onConfirm={onConfirm}
          cancelText={translations.cancel}
          confirmText={translations.confirm}
        />
      </Stack>
    </Modal>
  );
});

CampaignDeleteModal.displayName = 'CampaignDeleteModal';

export default CampaignDeleteModal;