// src/app/[locale]/campaigns/components/CampaignTable.tsx
'use client';

import { memo, useMemo } from 'react';
import { Paper, Table, Stack, Group, Pagination } from '@mantine/core';
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

// Memoized table header
const TableHeader = memo(({ translations }: { 
  translations: CampaignTableProps['translations']['table'] 
}) => {
  const headerStyle = {
    fontWeight: 600,
    color: 'var(--mantine-color-gray-8)',
    borderBottom: '2px solid var(--mantine-color-gray-2)'
  };

  return (
    <Table.Thead style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Table.Tr>
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

// Memoized pagination component
const TablePagination = memo(({ 
  pagination, 
  onPageChange 
}: {
  pagination: CampaignTableProps['pagination'];
  onPageChange: (page: number) => void;
}) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <Group justify="center" p="lg" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Pagination
        value={pagination.page}
        onChange={onPageChange}
        total={pagination.totalPages}
        size="sm"
        radius="md"
      />
    </Group>
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
        shadow="xs" 
        radius="md" 
        withBorder
        style={{ overflow: 'hidden' }}
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
      shadow="xs" 
      radius="md" 
      withBorder
      style={{ overflow: 'hidden' }}
    >
      <Stack gap={0}>
        <Table.ScrollContainer minWidth={800}>
          <Table 
            striped 
            highlightOnHover
            style={{
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <TableHeader translations={translations.table} />
            
            <Table.Tbody>
              {campaigns.map((campaign) => (
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