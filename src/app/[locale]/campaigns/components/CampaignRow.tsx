// src/components/campaigns/CampaignRow.tsx
'use client';

import { Campaign } from '@/lib/api/campaigns';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { 
  PlayIcon, 
  PauseIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon, UserPlusIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface CampaignRowProps {
  campaign: Campaign;
  locale: string;
  actionLoading: string | null;
  translations: {
    status: {
      active: string;
      paused: string;
      completed: string;
      expired: string;
    };
  };
  onStatusChange: (campaignId: string, newStatus: Campaign['status']) => void;
  onDelete: (campaignId: string) => void;
}

export default function CampaignRow({ 
  campaign, 
  locale, 
  actionLoading, 
  translations,
  onStatusChange,
  onDelete
}: CampaignRowProps) {
  const dateLocale = locale === 'vi' ? vi : enUS;

  const getStatusColor = (status: Campaign['status']) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInteractionIcon = (type: string) => {
    const icons = {
      like: <HeartIcon className="h-4 w-4 text-red-500" />,
      view: <EyeIcon className="h-4 w-4 text-blue-500" />,
      comment: (
        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      )
    };
    return icons[type as keyof typeof icons] || null;
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons = {
      video: <VideoCameraIcon className="h-5 w-5 text-purple-500" />,
      follow: <UserPlusIcon className="h-5 w-5 text-blue-500" />
    };
    return icons[type as keyof typeof icons] || null;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="hover:bg-gray-50"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getCampaignTypeIcon(campaign.campaign_type)}
          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
            {campaign.campaign_type}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {campaign.campaign_type === 'video' ? (
            <span className="font-mono">#{campaign.tiktok_video_id}</span>
          ) : (
            <span>@{campaign.target_tiktok_username}</span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {campaign.interaction_type && (
          <div className="flex items-center">
            {getInteractionIcon(campaign.interaction_type)}
            <span className="ml-2 text-sm text-gray-900 capitalize">
              {campaign.interaction_type}
            </span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full"
              style={{
                width: `${Math.min((campaign.current_count / campaign.target_count) * 100, 100)}%`
              }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {campaign.current_count}/{campaign.target_count}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {campaign.credits_per_action}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
          {translations.status[campaign.status]}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDistanceToNow(new Date(campaign.created_at), { 
          addSuffix: true, 
          locale: dateLocale 
        })}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {campaign.status === 'active' ? (
            <button
              onClick={() => onStatusChange(campaign.id, 'paused')}
              disabled={actionLoading === campaign.id}
              className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
              title="Pause"
            >
              <PauseIcon className="h-4 w-4" />
            </button>
          ) : campaign.status === 'paused' ? (
            <button
              onClick={() => onStatusChange(campaign.id, 'active')}
              disabled={actionLoading === campaign.id}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Resume"
            >
              <PlayIcon className="h-4 w-4" />
            </button>
          ) : null}
          
          <button className="text-blue-600 hover:text-blue-900" title="View">
            <EyeIcon className="h-4 w-4" />
          </button>
          
          <button className="text-gray-600 hover:text-gray-900" title="Edit">
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(campaign.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}