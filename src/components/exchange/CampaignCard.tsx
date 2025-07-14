// src/components/exchange/CampaignCard.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  ExternalLink,
  Clock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExchange, type ActionState } from '@/hooks/useExchange';

interface Campaign {
  id: string;
  user_id: string;
  interaction_type: 'like' | 'comment' | 'follow' | 'view';
  credits_per_action: number;
  target_count: number;
  current_count: number;
  remaining_credits: number;
  created_at: string;
  creator_tiktok?: string;
  videos: {
    title: string;
    description?: string;
    category: string;
    video_url: string;
  }[];
}

interface CampaignCardProps {
  campaign: Campaign;
  userCredits: number;
  userTikTokUsername?: string;
}

interface ActionData {
  initialData?: {
    diggCount?: number;
    videoUrl?: string;
    targetUsername?: string;
    userUsername?: string;
  };
  error?: string;
}

export default function CampaignCard({ 
  campaign, 
  userCredits,
  userTikTokUsername
}: CampaignCardProps) {
  const t = useTranslations('Exchange');
  const { prepareAction, claimCredits } = useExchange();
  
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [actionData, setActionData] = useState<ActionData>({});
  const [loading, setLoading] = useState(false);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-700 border-red-200';
      case 'comment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'follow': return 'bg-green-100 text-green-700 border-green-200';
      case 'view': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return t('campaign.timeAgo.daysAgo', { days: diffDays });
    } else if (diffHours > 0) {
      return t('campaign.timeAgo.hoursAgo', { hours: diffHours });
    } else {
      return t('campaign.timeAgo.justNow');
    }
  };

  const completionPercentage = Math.round((campaign.current_count / campaign.target_count) * 100);
  const canAfford = userCredits >= campaign.credits_per_action;
  const video = campaign.videos[0]; // Take first video

  // Check if this action type is supported
  const isSupported = ['like', 'follow'].includes(campaign.interaction_type);

  // Step 1: Prepare action (fetch initial data)
  const handlePrepareAction = async () => {
    setLoading(true);
    setActionState('preparing');
    setActionData({});

    try {
      const result = await prepareAction(campaign.id, campaign.interaction_type, campaign);
      
      if (result.success && result.actionData) {
        setActionData(result.actionData);
        setActionState('ready_to_claim');
      } else {
        setActionData({ error: result.error || 'Failed to prepare action' });
        setActionState('error');
      }
    } catch (error) {
      console.error('Prepare action error:', error);
      setActionData({ error: 'An error occurred while preparing the action' });
      setActionState('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Open TikTok for user action
  const handleOpenTikTok = () => {
    if (campaign.interaction_type === 'follow' && campaign.creator_tiktok) {
      window.open(`https://tiktok.com/@${campaign.creator_tiktok}`, '_blank');
    } else if (campaign.interaction_type === 'like' && video?.video_url) {
      window.open(video.video_url, '_blank');
    }
  };

  // Step 3: Claim credits after user performed action
  const handleClaimCredits = async () => {
    setLoading(true);
    setActionState('claiming');

    try {
      const result = await claimCredits(campaign.id, campaign.interaction_type, actionData);
      
      if (result.success) {
        setActionState('completed');
        // Show success message or update UI
      } else {
        setActionData({ ...actionData, error: result.error || 'Failed to claim credits' });
        setActionState('error');
      }
    } catch (error) {
      console.error('Claim credits error:', error);
      setActionData({ ...actionData, error: 'An error occurred while claiming credits' });
      setActionState('error');
    } finally {
      setLoading(false);
    }
  };

  const resetAction = () => {
    setActionState('idle');
    setActionData({});
  };

  const renderActionButtons = () => {
    if (!isSupported) {
      return (
        <Button disabled className="w-full">
          <AlertCircle className="w-4 h-4 mr-2" />
          {campaign.interaction_type.charAt(0).toUpperCase() + campaign.interaction_type.slice(1)} - Coming Soon
        </Button>
      );
    }

    if (!canAfford) {
      return (
        <Button disabled className="w-full">
          Need {campaign.credits_per_action} credits
        </Button>
      );
    }

    if (campaign.remaining_credits < campaign.credits_per_action) {
      return (
        <Button disabled className="w-full">
          Campaign Full
        </Button>
      );
    }

    // Check if user has TikTok connected
    if (!userTikTokUsername) {
      return (
        <Button disabled className="w-full">
          <AlertCircle className="w-4 h-4 mr-2" />
          Connect TikTok to participate
        </Button>
      );
    }

    switch (actionState) {
      case 'idle':
        return (
          <Button
            onClick={handlePrepareAction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
          >
            {getActionIcon(campaign.interaction_type)}
            <span className="ml-2">
              Start {campaign.interaction_type.charAt(0).toUpperCase() + campaign.interaction_type.slice(1)}
            </span>
          </Button>
        );

      case 'preparing':
        return (
          <Button disabled className="w-full">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparing...
          </Button>
        );

      case 'ready_to_claim':
        return (
          <div className="space-y-2">
            <Button
              onClick={handleOpenTikTok}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to TikTok & {campaign.interaction_type.charAt(0).toUpperCase() + campaign.interaction_type.slice(1)}
            </Button>
            <Button
              onClick={handleClaimCredits}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Verifying...' : `Claim ${campaign.credits_per_action} Credits`}
            </Button>
          </div>
        );

      case 'claiming':
        return (
          <Button disabled className="w-full">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying & Claiming...
          </Button>
        );

      case 'completed':
        return (
          <Button disabled className="w-full bg-green-500 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Credits Earned!
          </Button>
        );

      case 'error':
        return (
          <div className="space-y-2">
            <Button
              onClick={resetAction}
              variant="outline"
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getInstructionText = () => {
    if (campaign.interaction_type === 'follow') {
      return `1. Click "Go to TikTok" and follow @${campaign.creator_tiktok}\n2. Come back and click "Claim Credits"`;
    } else if (campaign.interaction_type === 'like') {
      return `1. Click "Go to TikTok" and like the video\n2. Come back and click "Claim Credits"`;
    }
    return '';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white text-xs">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  @{campaign.creator_tiktok || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(campaign.created_at)}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={getInteractionColor(campaign.interaction_type)}
            >
              {getActionIcon(campaign.interaction_type)}
              <span className="ml-1 capitalize">{campaign.interaction_type}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Video Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
              {video?.title || 'Untitled Video'}
            </h4>
            
            {video?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {video.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {video?.category || 'General'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(video?.video_url, '_blank')}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="font-medium">
                {campaign.current_count}/{campaign.target_count}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {campaign.target_count - campaign.current_count} actions remaining
            </p>
          </div>

          {/* Earnings */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Earn {campaign.credits_per_action} credits
              </span>
              <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">per {campaign.interaction_type}</span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {actionState === 'error' && actionData.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {actionData.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions for ready_to_claim state */}
          {actionState === 'ready_to_claim' && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs whitespace-pre-line">
                {getInstructionText()}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {renderActionButtons()}

          {!canAfford && actionState === 'idle' && (
            <p className="text-xs text-red-600 text-center">
              You need {campaign.credits_per_action - userCredits} more credits
            </p>
          )}

          {!isSupported && (
            <p className="text-xs text-gray-500 text-center">
              {campaign.interaction_type.charAt(0).toUpperCase() + campaign.interaction_type.slice(1)} verification is coming soon
            </p>
          )}

          {!userTikTokUsername && (
            <p className="text-xs text-orange-600 text-center">
              Please connect your TikTok account in your profile to participate
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}