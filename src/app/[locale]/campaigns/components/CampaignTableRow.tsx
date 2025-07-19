// src/app/[locale]/campaigns/components/CampaignTableRow.tsx
'use client';

import { memo, useCallback } from 'react';
import { Table, Group, Text, Badge, Progress, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { 
  IconVideo, 
  IconUserPlus, 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconEye, 
  IconEdit, 
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

const CampaignTableRow = memo(({ 
  campaign, 
  dateLocale, 
  actionLoading, 
  translations, 
  onStatusChange, 
  onDelete 
}: CampaignTableRowProps) => {
  const getStatusColor = useCallback((status: Campaign['status']) => {
    const statusColors = {
      active: 'green',
      paused: 'yellow',
      completed: 'blue',
      expired: 'red'
    };
    return statusColors[status] || 'gray';
  }, []);

  const getInteractionIcon = useCallback((type: string) => {
    const icons = {
      like: IconHeart,
      view: IconEye,
      comment: IconMessageCircle,
      follow: IconUserPlus,
    };
    return icons[type as keyof typeof icons] || IconUserPlus;
  }, []);

  const getCampaignTypeIcon = useCallback((type: string) => {
    const icons = {
      video: IconVideo,
      follow: IconUserPlus
    };
    return icons[type as keyof typeof icons] || IconVideo;
  }, []);

  const TypeIcon = getCampaignTypeIcon(campaign.campaign_type);
  const InteractionIcon = getInteractionIcon(campaign.interaction_type || "follow");

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs">
          <TypeIcon size={16} />
          <Text size="sm" fw={500} tt="capitalize">
            {campaign.campaign_type}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="sm" ff="monospace">
          {campaign.campaign_type === 'video' 
            ? `#${campaign.tiktok_video_id}`
            : `@${campaign.target_tiktok_username}`
          }
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <InteractionIcon size={16} />
          <Text size="sm" tt="capitalize">
            {campaign.interaction_type || 'follow'}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Stack gap="xs">
          <Progress 
            value={(campaign.current_count / campaign.target_count) * 100} 
            size="sm"
            color="pink"
          />
          <Text size="xs" c="dimmed">
            {campaign.current_count}/{campaign.target_count}
          </Text>
        </Stack>
      </Table.Td>

      <Table.Td>
        <Text size="sm">{campaign.credits_per_action}</Text>
      </Table.Td>

      <Table.Td>
        <Badge color={getStatusColor(campaign.status)} variant="light">
          {translations.status[campaign.status]}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDistanceToNow(new Date(campaign.created_at), {
            addSuffix: true,
            locale: dateLocale
          })}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          {campaign.status === 'active' ? (
            <Tooltip label="Pause">
              <ActionIcon
                variant="light"
                color="yellow"
                onClick={() => onStatusChange(campaign.id, 'paused')}
                loading={actionLoading === campaign.id}
                size="sm"
              >
                <IconPlayerPause size={14} />
              </ActionIcon>
            </Tooltip>
          ) : campaign.status === 'paused' ? (
            <Tooltip label="Resume">
              <ActionIcon
                variant="light"
                color="green"
                onClick={() => onStatusChange(campaign.id, 'active')}
                loading={actionLoading === campaign.id}
                size="sm"
              >
                <IconPlayerPlay size={14} />
              </ActionIcon>
            </Tooltip>
          ) : null}

          <Tooltip label="View">
            <ActionIcon variant="light" color="blue" size="sm">
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Edit">
            <ActionIcon variant="light" color="gray" size="sm">
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete">
            <ActionIcon 
              variant="light" 
              color="red" 
              onClick={() => onDelete(campaign.id)}
              size="sm"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
});

CampaignTableRow.displayName = 'CampaignTableRow';

export default CampaignTableRow;