// src/app/[locale]/campaigns/components/CampaignEmptyState.tsx
'use client';

import { memo } from 'react';
import { Stack, Text, Button, Center, ThemeIcon, Box } from '@mantine/core';
import { IconVideo, IconSparkles, IconArrowRight } from '@tabler/icons-react';

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
    <Center py={100} px={20} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      
      <Stack align="center" gap="xl" maw={450} style={{ position: 'relative', zIndex: 1 }}>
        <Box style={{ position: 'relative' }}>
          <ThemeIcon 
            size={100} 
            radius="xl" 
            variant="light"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '2px solid var(--mantine-color-violet-1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <IconVideo size={48} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          </ThemeIcon>
          
          {/* Floating sparkle */}
          <ThemeIcon
            size={32}
            radius="xl"
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            <IconSparkles size={16} color="white" stroke={2} />
          </ThemeIcon>
        </Box>

        <Stack align="center" gap="md" ta="center">
          <Text 
            size="xl" 
            fw={800}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '28px',
              lineHeight: 1.2
            }}
          >
            {translations.title}
          </Text>
          <Text 
            size="md" 
            c="gray.6" 
            ta="center"
            lh={1.6}
            maw={380}
            style={{ fontSize: '16px' }}
          >
            {translations.description}
          </Text>
        </Stack>

        <Button
          onClick={onCreateCampaign}
          size="lg"
          radius="xl"
          rightSection={<IconArrowRight size={20} />}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            minWidth: 200,
            height: 50,
            fontWeight: 700,
            fontSize: '16px',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
            marginTop: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
          }}
        >
          {translations.action}
        </Button>
      </Stack>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(10deg);
          }
        }
      `}</style>
    </Center>
  );
});

CampaignEmptyState.displayName = 'CampaignEmptyState';

export default CampaignEmptyState;