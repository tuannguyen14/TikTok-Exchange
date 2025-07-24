// src/app/[locale]/campaigns/components/CampaignTableRow.tsx
'use client';

import { memo, useCallback, useMemo } from 'react';
import { Table, Group, Text, Badge, Progress, Stack, ActionIcon, Tooltip } from '@mantine/core';
import {
  IconVideo,
  IconUserPlus,
  IconPlayerPlay,
  IconPlayerPause,
  IconEye,
  IconTrash,
  IconHeart,
  IconMessageCircle
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Campaign } from '@/lib/api/campaigns';

interface CampaignTableRowProps {
  campaign: Campaign;
  dateLocale: any;
  actionLoading: string | null;
  translations: {
    status: {
      active: string;
      paused: string;
      completed: string;
      expired: string;
    };
  };
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
}

// Memoized icon components for better performance
const TypeIcon = memo(({ type }: { type: string }) => {
  const Icon = type === 'video' ? IconVideo : IconUserPlus;
  const color = type === 'video' ? 'red' : 'blue';
  return <Icon size={16} color={color} />;
});
TypeIcon.displayName = 'TypeIcon';

const InteractionIcon = memo(({ type }: { type: string }) => {
  const iconMap = {
    like: IconHeart,
    view: IconEye,
    comment: IconMessageCircle,
    follow: IconUserPlus,
  };
  const Icon = iconMap[type as keyof typeof iconMap] || IconUserPlus;
  const color = type === 'like' ? 'red' : 'blue';
  return <Icon size={16} color={color} />;
});
InteractionIcon.displayName = 'InteractionIcon';

// Memoized progress component
const CampaignProgress = memo(({ current, target }: { current: number; target: number }) => {
  const percentage = useMemo(() => (current / target) * 100, [current, target]);

  return (
    <Stack gap="xs">
      <Progress
        value={percentage}
        size="sm"
        color="pink"
        style={{
          backgroundColor: 'var(--mantine-color-gray-1)'
        }}
      />
      <Text size="xs" c="gray.7" fw={500}>
        {current.toLocaleString()}/{target.toLocaleString()}
      </Text>
    </Stack>
  );
});
CampaignProgress.displayName = 'CampaignProgress';

// Memoized action buttons
const ActionButtons = memo(({
  campaign,
  actionLoading,
  onStatusChange,
  onDelete
}: {
  campaign: Campaign;
  actionLoading: string | null;
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
}) => {
  const isLoading = actionLoading === campaign.id;

  const handleStatusToggle = useCallback(() => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onStatusChange(campaign.id, newStatus);
  }, [campaign.id, campaign.status, onStatusChange]);

  const handleDelete = useCallback(() => {
    onDelete(campaign.id);
  }, [campaign.id, onDelete]);

  return (
    <Group gap="xs">
      {(campaign.status === 'active' || campaign.status === 'paused') && (
        <Tooltip
          label={campaign.status === 'active' ? 'Tạm dừng' : 'Tiếp tục'}
          openDelay={500}
        >
          <ActionIcon
            variant="light"
            color={campaign.status === 'active' ? 'yellow' : 'green'}
            onClick={handleStatusToggle}
            loading={isLoading}
            size="sm"
          >
            {campaign.status === 'active' ? (
              <IconPlayerPause size={14} />
            ) : (
              <IconPlayerPlay size={14} />
            )}
          </ActionIcon>
        </Tooltip>
      )}

      {/* <Tooltip label="Xem chi tiết" openDelay={500}>
        <ActionIcon
          variant="light"
          color="blue"
          size="sm"
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'var(--mantine-color-blue-1)'
              }
            }
          }}
        >
          <IconEye size={14} />
        </ActionIcon>
      </Tooltip> */}

      {/* <Tooltip label="Chỉnh sửa" openDelay={500}>
        <ActionIcon
          variant="light"
          color="gray"
          size="sm"
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'var(--mantine-color-gray-1)'
              }
            }
          }}
        >
          <IconEdit size={14} />
        </ActionIcon>
      </Tooltip> */}

      <Tooltip label="Xóa" openDelay={500}>
        <ActionIcon
          variant="light"
          color="red"
          onClick={handleDelete}
          size="sm"
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'var(--mantine-color-red-1)'
              }
            }
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
});
ActionButtons.displayName = 'ActionButtons';

const CampaignTableRow = memo(({
  campaign,
  dateLocale,
  actionLoading,
  translations,
  onStatusChange,
  onDelete
}: CampaignTableRowProps) => {

  // Memoized calculations
  const statusColor = useMemo(() => {
    const statusColors = {
      active: 'green',
      paused: 'yellow',
      completed: 'blue',
      expired: 'red'
    };
    return statusColors[campaign.status] || 'gray';
  }, [campaign.status]);

  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(campaign.created_at), {
      addSuffix: true,
      locale: dateLocale
    });
  }, [campaign.created_at, dateLocale]);

  const targetDisplay = useMemo(() => {
    return campaign.campaign_type === 'video'
      ? `#${campaign.tiktok_video_id}`
      : `@${campaign.target_tiktok_username}`;
  }, [campaign.campaign_type, campaign.tiktok_video_id, campaign.target_tiktok_username]);

  return (
    <Table.Tr
      style={{
        transition: 'background-color 200ms ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
      }}
    >
      <Table.Td>
        <Group gap="xs">
          <TypeIcon type={campaign.campaign_type} />
          <Text size="sm" fw={600} c="gray.8" tt="capitalize">
            {campaign.campaign_type}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text
          size="sm"
          ff="monospace"
          c="gray.7"
          fw={500}
          style={{
            wordBreak: 'break-all'
          }}
        >
          {targetDisplay}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <InteractionIcon type={campaign.interaction_type || 'follow'} />
          <Text size="sm" tt="capitalize" c="gray.7" fw={500}>
            {campaign.interaction_type || 'follow'}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <CampaignProgress
          current={campaign.current_count}
          target={campaign.target_count}
        />
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={600} c="gray.8">
          {campaign.credits_per_action.toLocaleString()}
        </Text>
      </Table.Td>

      <Table.Td>
        <Badge
          color={statusColor}
          variant="light"
          style={{
            fontWeight: 600,
            textTransform: 'capitalize'
          }}
        >
          {translations.status[campaign.status]}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="gray.6" fw={500}>
          {formattedDate}
        </Text>
      </Table.Td>

      <Table.Td>
        <ActionButtons
          campaign={campaign}
          actionLoading={actionLoading}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </Table.Td>
    </Table.Tr>
  );
});

CampaignTableRow.displayName = 'CampaignTableRow';

export default CampaignTableRow;