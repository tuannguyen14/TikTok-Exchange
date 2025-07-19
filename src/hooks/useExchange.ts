// hooks/useExchange.ts

import { useState, useEffect, useCallback } from 'react';
import {
  exchangeApi,
  Campaign,
  Action,
  PerformActionRequest,
  VerifyActionRequest
} from '@/lib/api/exchange';

// Generic state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// TikTok info state
interface TikTokInfoState {
  video_info?: any;
  user_info?: any;
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
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/exchange/campaigns?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setState({
          data: data.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: data.error || 'Failed to fetch campaigns'
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
      const params = new URLSearchParams();
      if (campaignId) params.append('campaignId', campaignId);
      if (actionType) params.append('actionType', actionType);
      if (status) params.append('status', status);

      const response = await fetch(`/api/exchange/actions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setState({
          data: data.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: data.error || 'Failed to fetch actions'
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

  // Perform action (claim credits)
  const performAction = useCallback(async (request: PerformActionRequest) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/exchange/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      return data;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Verify action before claiming credits
  const verifyAction = useCallback(async (request: VerifyActionRequest) => {
    setVerifyLoading(true);
    try {
      const response = await fetch('/api/exchange/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      return data;
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
      const response = await fetch('/api/exchange/verify-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          targetUsername,
          userUsername: currentUserTikTok
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setVerifyLoading(false);
    }
  }, []);

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

      const videoUrl = `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
      
      const response = await fetch('/api/exchange/verify-like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          videoUrl,
          previousCount: previousDiggCount
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setVerifyLoading(false);
    }
  }, []);

  // Fetch TikTok info on demand
  const fetchTikTokInfo = useCallback(async (campaign: Campaign): Promise<{ success: boolean; data?: TikTokInfoState; error?: string }> => {
    if (!campaign.target_tiktok_username) {
      return { success: false, error: 'No TikTok username provided' };
    }

    try {
      let url: string;
      
      if (campaign.campaign_type === 'video' && campaign.tiktok_video_id) {
        url = `/api/exchange/tiktok-info?type=video&username=${encodeURIComponent(campaign.target_tiktok_username)}&videoId=${encodeURIComponent(campaign.tiktok_video_id)}`;
      } else {
        url = `/api/exchange/tiktok-info?type=profile&username=${encodeURIComponent(campaign.target_tiktok_username)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      return data;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }, []);

  // Get initial video info for like verification
  const getInitialVideoInfo = useCallback(async (campaign: Campaign) => {
    if (campaign.campaign_type !== 'video' || !campaign.tiktok_video_id || !campaign.target_tiktok_username) {
      return { success: false, error: 'Invalid campaign for video info' };
    }

    return fetchTikTokInfo(campaign);
  }, [fetchTikTokInfo]);

  // Open TikTok URL
  const openTikTok = useCallback((url: string) => {
    // Try to open in TikTok app first, fallback to web
    const tiktokAppUrl = url.replace('https://www.tiktok.com', 'tiktok://');
    
    // For mobile devices, try app first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = tiktokAppUrl;
      
      // Fallback to web after a short delay
      setTimeout(() => {
        window.open(url, '_blank');
      }, 1000);
    } else {
      // For desktop, open in new tab
      window.open(url, '_blank');
    }
  }, []);

  // Generate TikTok URLs
  const generateTikTokUrl = useCallback((campaign: Campaign) => {
    if (campaign.campaign_type === 'follow' && campaign.target_tiktok_username) {
      return `https://www.tiktok.com/@${campaign.target_tiktok_username}`;
    } else if (campaign.campaign_type === 'video' && campaign.tiktok_video_id && campaign.target_tiktok_username) {
      return `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
    }
    return null;
  }, []);

  // Check if user can perform action
  const canPerformAction = useCallback((campaign: Campaign, userActions: Action[]) => {
    // Check if user has already performed this action
    const actionType = campaign.campaign_type === 'follow' ? 'follow' : campaign.interaction_type;
    const hasPerformed = userActions.some(
      action => action.campaign_id === campaign.id && action.action_type === actionType
    );

    if (hasPerformed) return false;
    
    // Check if campaign is active and has remaining credits
    return campaign.status === 'active' && campaign.remaining_credits > 0;
  }, []);

  // Helper functions
  const getProgressPercentage = useCallback((current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  }, []);

  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  const formatCredits = useCallback((credits: number): string => {
    return credits.toLocaleString();
  }, []);

  return {
    // Loading states
    actionLoading,
    verifyLoading,

    // Action methods
    performAction,
    verifyAction,
    verifyFollowAction,
    verifyLikeAction,

    // TikTok methods
    fetchTikTokInfo,
    getInitialVideoInfo,

    // Utility methods
    openTikTok,
    generateTikTokUrl,
    canPerformAction,

    // Helper functions
    formatCredits,
    formatCount,
    getProgressPercentage,
  };
}