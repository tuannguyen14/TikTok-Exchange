// hooks/useExchange.ts

import { useState, useEffect, useCallback } from 'react';
import {
  exchangeApi,
  Campaign,
  Action,
  PerformActionRequest,
  VerifyActionRequest
} from '@/lib/api/exchange';
import { useTikTokApi } from './useTikTok';

// Generic state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook for managing campaigns
export function useExchangeCampaigns(
  type?: 'video' | 'follow',
  status?: 'active' | 'completed',
  sortBy?: 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits'
) {
  const [state, setState] = useState<ApiState<Campaign[]>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchCampaigns = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await exchangeApi.getCampaigns(type, status, sortBy);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to fetch campaigns'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [type, status, sortBy]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchCampaigns
  };
}

// Hook for managing user actions
export function useUserActions(
  campaignId?: string,
  actionType?: 'view' | 'like' | 'comment' | 'follow',
  status?: 'completed' | 'pending' | 'rejected'
) {
  const [state, setState] = useState<ApiState<Action[]>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchActions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await exchangeApi.getUserActions(campaignId, actionType, status);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to fetch actions'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [campaignId, actionType, status]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return {
    actions: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchActions
  };
}


// Main hook for exchange operations
export function useExchange() {
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const tikTokApi = useTikTokApi();

  // Perform action (claim credits)
  const performAction = useCallback(async (request: PerformActionRequest) => {
    setActionLoading(true);
    try {
      const response = await exchangeApi.performAction(request);
      return response;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Verify action before claiming credits
  const verifyAction = useCallback(async (request: VerifyActionRequest) => {
    setVerifyLoading(true);
    try {
      const response = await exchangeApi.verifyAction(request);
      return response;
    } finally {
      setVerifyLoading(false);
    }
  }, []);

  // Enhanced verification for follow actions
  const verifyFollowAction = useCallback(async (
    campaignId: string,
    targetUsername: string,
    currentUserTikTok: string
  ) => {
    setVerifyLoading(true);
    try {
      // Get followers list from TikTok API
      const followersResponse = await tikTokApi.getFollowers(currentUserTikTok);
      if (!followersResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch followers list'
        };
      }

      // Check if current user is in the followers list
      const userList = followersResponse.data?.responseData?.userList || [];
      const isFollowing = userList.some(
        (follower: any) => follower.user.uniqueId === targetUsername
      );

      if (isFollowing) {
        // User is following, now perform the action
        const actionResponse = await performAction({
          campaignId,
          actionType: 'follow',
          proofData: {
            verified: true,
            followersData: followersResponse.data
          }
        });

        return actionResponse;
      } else {
        return {
          success: false,
          error: 'Follow action not detected. Please follow the user first.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setVerifyLoading(false);
    }
  }, [performAction, tikTokApi]);

  // Enhanced verification for like actions
  const verifyLikeAction = useCallback(async (
    campaignId: string,
    campaign: Campaign,
    previousDiggCount: number
  ) => {
    setVerifyLoading(true);
    try {
      if (!campaign.target_tiktok_username || !campaign.tiktok_video_id) {
        return {
          success: false,
          error: 'Invalid campaign data'
        };
      }

      // Get current video info
      const videoUrl = `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
      const videoResponse = await tikTokApi.getVideoInfo(videoUrl);

      if (!videoResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch video information'
        };
      }

      const currentDiggCount = videoResponse.data?.diggCount || 0;

      // Check if like count increased
      if (currentDiggCount > previousDiggCount) {
        // Like detected, perform the action
        const actionResponse = await performAction({
          campaignId,
          actionType: 'like',
          proofData: {
            verified: true,
            previousCount: previousDiggCount,
            currentCount: currentDiggCount,
            videoData: videoResponse.data
          }
        });

        return actionResponse;
      } else {
        return {
          success: false,
          error: 'Like action not detected. Please like the video first.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setVerifyLoading(false);
    }
  }, [performAction, tikTokApi]);

  // Open TikTok URL
  const openTikTok = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Generate TikTok URLs
  const generateTikTokUrl = useCallback((campaign: Campaign) => {
    if (campaign.campaign_type === 'follow') {
      return `https://www.tiktok.com/@${campaign.target_tiktok_username}`;
    } else if (campaign.campaign_type === 'video' && campaign.tiktok_video_id && campaign.target_tiktok_username) {
      return `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
    }
    return '';
  }, []);

  // Check if user can perform action
  const canPerformAction = useCallback((campaign: Campaign, userActions: Action[]) => {
    return exchangeApi.canPerformAction(campaign, userActions);
  }, []);

  // Get initial video info for like tracking
  const getInitialVideoInfo = useCallback(async (campaign: Campaign) => {
    if (campaign.campaign_type === 'video' && campaign.tiktok_video_id && campaign.target_tiktok_username) {
      const videoUrl = `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
      const response = await tikTokApi.getVideoInfo(videoUrl);
      return response;
    }
    return { success: false, error: 'Invalid campaign data' };
  }, [tikTokApi]);

  return {
    // Loading states
    actionLoading,
    verifyLoading,
    tikTokLoading: tikTokApi.loading,

    // Action methods
    performAction,
    verifyAction,
    verifyFollowAction,
    verifyLikeAction,

    // Utility methods
    openTikTok,
    generateTikTokUrl,
    canPerformAction,
    getInitialVideoInfo,

    // API utilities
    formatCredits: exchangeApi.formatCredits,
    formatCount: exchangeApi.formatCount,
    getProgressPercentage: exchangeApi.getProgressPercentage,
  };
}