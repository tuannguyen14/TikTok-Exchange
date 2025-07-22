// src/app/[locale]/campaigns/components/CampaignTable.tsx
'use client';

import { memo, useMemo } from 'react';
import { Paper, Table, Stack, Group, Pagination, Box, Text } from '@mantine/core';
import { Campaign } from '@/lib/api/campaigns';
import CampaignTableRow from './CampaignTableRow';
import CampaignEmptyState from './CampaignEmptyState';

interface CampaignTableProps {
  campaigns: Campaign[];
  locale: string;
  actionLoading: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  translations: {
    table: {
      type: string;
      target: string;
      interaction: string;
      progress: string;
      creditsPerAction: string;
      status: string;
      created: string;
      actions: string;
    };
    status: {
      active: string;
      paused: string;
      completed: string;
      expired: string;
    };
    empty: {
      title: string;
      description: string;
      action: string;
    };
  };
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
  onCreateCampaign: () => void;
  onPageChange: (page: number) => void;
  dateLocale: any;
}

// Enhanced table header with modern design
const TableHeader = memo(({ translations }: { 
  translations: CampaignTableProps['translations']['table'] 
}) => {
  const headerStyle = {
    fontWeight: 700,
    color: 'var(--mantine-color-gray-7)',
    borderBottom: 'none',
    fontSize: '13px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '16px',
  };

  return (
    <Table.Thead>
      <Table.Tr style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
        <Table.Th style={headerStyle}>{translations.type}</Table.Th>
        <Table.Th style={headerStyle}>{translations.target}</Table.Th>
        <Table.Th style={headerStyle}>{translations.interaction}</Table.Th>
        <Table.Th style={headerStyle}>{translations.progress}</Table.Th>
        <Table.Th style={headerStyle}>{translations.creditsPerAction}</Table.Th>
        <Table.Th style={headerStyle}>{translations.status}</Table.Th>
        <Table.Th style={headerStyle}>{translations.created}</Table.Th>
        <Table.Th style={headerStyle}>{translations.actions}</Table.Th>
      </Table.Tr>
    </Table.Thead>
  );
});
TableHeader.displayName = 'TableHeader';

// Enhanced pagination component with modern design
const TablePagination = memo(({ 
  pagination, 
  onPageChange 
}: {
  pagination: CampaignTableProps['pagination'];
  onPageChange: (page: number) => void;
}) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <Box
      style={{
        borderTop: '1px solid var(--mantine-color-gray-2)',
        padding: '20px',
        background: 'linear-gradient(to bottom, transparent, var(--mantine-color-gray-0))'
      }}
    >
      <Group justify="space-between" align="center">
        <Text size="sm" c="gray.6" fw={500}>
          Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} chiến dịch
        </Text>
        
        <Pagination
          value={pagination.page}
          onChange={onPageChange}
          total={pagination.totalPages}
          size="md"
          radius="xl"
          withEdges
          styles={{
            control: {
              border: '1px solid var(--mantine-color-gray-3)',
              transition: 'all 200ms ease',
              '&[data-active]': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              },
              '&:not([data-active]):hover': {
                backgroundColor: 'var(--mantine-color-gray-1)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }
            }
          }}
        />
      </Group>
    </Box>
  );
});
TablePagination.displayName = 'TablePagination';

const CampaignTable = memo(({
  campaigns,
  locale,
  actionLoading,
  pagination,
  translations,
  onStatusChange,
  onDelete,
  onCreateCampaign,
  onPageChange,
  dateLocale
}: CampaignTableProps) => {
  
  // Memoize row translations to prevent recreating objects
  const rowTranslations = useMemo(() => ({
    status: translations.status
  }), [translations.status]);

  // Early return for empty state
  if (campaigns.length === 0) {
    return (
      <Paper 
        shadow="sm" 
        radius="lg" 
        withBorder
        style={{ 
          overflow: 'hidden',
          borderColor: 'var(--mantine-color-gray-2)',
          background: 'white'
        }}
      >
        <CampaignEmptyState 
          onCreateCampaign={onCreateCampaign}
          translations={translations.empty}
        />
      </Paper>
    );
  }

  return (
    <Paper 
      shadow="sm" 
      radius="lg" 
      withBorder
      style={{ 
        overflow: 'hidden',
        borderColor: 'var(--mantine-color-gray-2)',
        background: 'white'
      }}
    >
      <Stack gap={0}>
        <Table.ScrollContainer minWidth={900}>
          <Table 
            verticalSpacing="sm"
            horizontalSpacing="md"
            style={{
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <TableHeader translations={translations.table} />
            
            <Table.Tbody>
              {campaigns.map((campaign, index) => (
                <CampaignTableRow
                  key={campaign.id}
                  campaign={campaign}
                  dateLocale={dateLocale}
                  actionLoading={actionLoading}
                  translations={rowTranslations}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <TablePagination 
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </Stack>
    </Paper>
  );
});

CampaignTable.displayName = 'CampaignTable';

export default CampaignTable;