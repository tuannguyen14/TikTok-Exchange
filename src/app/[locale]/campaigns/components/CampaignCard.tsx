// src/app/[locale]/campaigns/components/CampaignCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Heart,
  MessageCircle,
  UserPlus,
  Eye,
  MoreVertical,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Coins
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  locale: string;
  onStatusUpdate: (campaignId: string, status: 'active' | 'paused') => void;
  onDelete: (campaignId: string) => void;
  updatingCampaign: string | null;
  deletingCampaign: string | null;
}

export function CampaignCard({ 
  campaign, 
  index, 
  locale,
  onStatusUpdate, 
  onDelete,
  updatingCampaign,
  deletingCampaign,
}: CampaignCardProps) {
  const router = useRouter();
  const t = useTranslations('Campaigns');
  
  const video = campaign.videos?.[0];
  const completion = Math.round((campaign.current_count / campaign.target_count) * 100);
  const isUpdating = updatingCampaign === campaign.id;
  const isDeleting = deletingCampaign === campaign.id;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {getActionIcon(campaign.interaction_type)}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {video?.title || t('card.untitled')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(campaign.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={getStatusColor(campaign.status)}
              >
                {t(`status.${campaign.status}`)}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    disabled={isUpdating || isDeleting}
                  >
                    {isUpdating || isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => window.open(video?.video_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t('card.viewVideo')}
                  </DropdownMenuItem>
                  
                  {campaign.status !== 'completed' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onStatusUpdate(
                          campaign.id, 
                          campaign.status === 'active' ? 'paused' : 'active'
                        )}
                      >
                        {campaign.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            {t('card.pauseCampaign')}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {t('card.resumeCampaign')}
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem
                    onClick={() => onDelete(campaign.id)}
                    className="text-red-600 dark:text-red-400"
                    disabled={campaign.current_count > 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('card.deleteCampaign')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Campaign Type and Credits */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {t(`actions.${campaign.interaction_type}`)}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('card.creditsEach', { count: campaign.credits_per_action })}
              </span>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
              <Coins className="w-3 h-3 mr-1" />
              {campaign.remaining_credits}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('card.progress')}</span>
              <span className="font-medium">
                {campaign.current_count}/{campaign.target_count} ({completion}%)
              </span>
            </div>
            <Progress value={completion} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('card.remaining', { count: campaign.target_count - campaign.current_count })}</span>
              <span>{t('card.spent', { count: campaign.total_credits - campaign.remaining_credits })}</span>
            </div>
          </div>

          {/* Video Info */}
          {video && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {video.category}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(video.video_url, '_blank')}
                  className="h-8 px-2"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {campaign.status !== 'completed' && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(
                  campaign.id, 
                  campaign.status === 'active' ? 'paused' : 'active'
                )}
                disabled={isUpdating}
                className="flex-1"
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    {t('card.pause')}
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    {t('card.resume')}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Completion Status */}
          {campaign.status === 'completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t('card.campaignCompleted')}
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {t('card.receivedInteractions', { count: campaign.current_count })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}