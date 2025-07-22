// src/app/[locale]/campaigns/components/CampaignDeleteModal.tsx
'use client';

import { memo } from 'react';
import { Modal, Stack, Text, Group, Button, ThemeIcon, Box } from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

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

// Memoized action buttons with enhanced design
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
  <Group justify="flex-end" gap="sm" mt="xl">
    <Button
      variant="light"
      onClick={onClose}
      disabled={loading}
      size="md"
      radius="xl"
      style={{
        fontWeight: 600,
        minWidth: 100,
        border: '1px solid var(--mantine-color-gray-3)',
        transition: 'all 200ms ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.transform = '';
      }}
    >
      {cancelText}
    </Button>
    <Button
      onClick={onConfirm}
      loading={loading}
      size="md"
      radius="xl"
      leftSection={!loading && <IconTrash size={18} />}
      style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        fontWeight: 700,
        minWidth: 100,
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
        transition: 'all 200ms ease'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
        }
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
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      size="md"
      radius="lg"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 3
      }}
      styles={{
        header: {
          padding: 0,
          paddingBottom: '20px'
        },
        title: {
          width: '100%'
        },
        close: {
          transition: 'all 200ms ease',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-red-1)',
            color: 'var(--mantine-color-red-6)'
          }
        }
      }}
      title={
        <Stack gap="md">
          <Center>
            <Box style={{ position: 'relative' }}>
              <ThemeIcon
                size={80}
                radius="xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '2px solid var(--mantine-color-red-2)',
                }}
              >
                <IconAlertTriangle size={40} stroke={1.5} style={{ color: 'var(--mantine-color-red-6)' }} />
              </ThemeIcon>
              
              {/* Decorative element */}
              <Box
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-red-6)',
                  animation: 'pulse 2s infinite'
                }}
              />
            </Box>
          </Center>
          
          <Text 
            fw={800} 
            size="xl" 
            ta="center"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {translations.title}
          </Text>
        </Stack>
      }
    >
      <Stack gap="lg">
        <Text 
          size="md" 
          c="gray.7"
          lh={1.6}
          ta="center"
        >
          {translations.description}
        </Text>
        
        <Box
          style={{
            backgroundColor: 'var(--mantine-color-red-0)',
            border: '1px solid var(--mantine-color-red-2)',
            borderRadius: 'var(--mantine-radius-md)',
            padding: '12px 16px',
            marginTop: '8px'
          }}
        >
          <Group gap="xs">
            <IconAlertTriangle size={16} style={{ color: 'var(--mantine-color-red-6)' }} />
            <Text size="sm" c="red.7" fw={500}>
              Hành động này không thể hoàn tác
            </Text>
          </Group>
        </Box>
        
        <ModalActions
          loading={loading}
          onClose={onClose}
          onConfirm={onConfirm}
          cancelText={translations.cancel}
          confirmText={translations.confirm}
        />
      </Stack>
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </Modal>
  );
});

// Add missing import
const Center = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    {children}
  </div>
);

CampaignDeleteModal.displayName = 'CampaignDeleteModal';

export default CampaignDeleteModal;