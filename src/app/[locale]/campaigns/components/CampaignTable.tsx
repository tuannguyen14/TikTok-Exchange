// src/app/[locale]/campaigns/components/CampaignTable.tsx
'use client';

import { memo } from 'react';
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
  if (campaigns.length === 0) {
    return (
      <Paper shadow="sm" radius="md" withBorder>
        <CampaignEmptyState 
          onCreateCampaign={onCreateCampaign}
          translations={translations.empty}
        />
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" radius="md" withBorder>
      <Stack gap={0}>
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{translations.table.type}</Table.Th>
                <Table.Th>{translations.table.target}</Table.Th>
                <Table.Th>{translations.table.interaction}</Table.Th>
                <Table.Th>{translations.table.progress}</Table.Th>
                <Table.Th>{translations.table.creditsPerAction}</Table.Th>
                <Table.Th>{translations.table.status}</Table.Th>
                <Table.Th>{translations.table.created}</Table.Th>
                <Table.Th>{translations.table.actions}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {campaigns.map((campaign) => (
                <CampaignTableRow
                  key={campaign.id}
                  campaign={campaign}
                  dateLocale={dateLocale}
                  actionLoading={actionLoading}
                  translations={translations}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Group justify="center" p="md">
            <Pagination
              value={pagination.page}
              onChange={onPageChange}
              total={pagination.totalPages}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Paper>
  );
});

CampaignTable.displayName = 'CampaignTable';

export default CampaignTable;