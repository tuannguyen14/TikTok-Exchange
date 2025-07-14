// src/hooks/useExchange.ts
import { useState, useCallback, useEffect } from 'react';
import { campaignAPI } from '@/lib/api/campaigns';

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

interface ExchangeStats {
  activeCampaigns: number;
  totalCreditsAvailable: number;
  activeUsers: number;
}

interface Filters {
  interaction_type?: 'like' | 'comment' | 'follow' | 'view';
  category?: string;
  min_credits?: number;
  max_credits?: number;
  search?: string;
}

// Action states for the new flow
export type ActionState = 'idle' | 'preparing' | 'ready_to_claim' | 'claiming' | 'completed' | 'error';

interface ActionData {
  initialData?: {
    diggCount?: number; // For like actions
    videoUrl?: string;
    targetUsername?: string; // For follow actions
    userUsername?: string;
  };
  error?: string;
}

interface UseExchangeReturn {
  campaigns: Campaign[];
  stats: ExchangeStats | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  success: string | null;
  hasMore: boolean;
  page: number;
  filters: Filters;
  searchTerm: string;
  
  // Actions
  fetchCampaigns: (isRefresh?: boolean, newPage?: number) => Promise<void>;
  setFilters: (filters: Filters) => void;
  setSearchTerm: (term: string) => void;
  loadMore: () => void;
  refresh: () => void;
  
  // New action flow methods
  prepareAction: (campaignId: string, actionType: string, campaign: Campaign) => Promise<{ success: boolean; actionData?: ActionData; error?: string }>;
  claimCredits: (campaignId: string, actionType: string, actionData: ActionData) => Promise<{ success: boolean; creditsEarned?: number; error?: string }>;
  
  clearMessages: () => void;
}

export function useExchange(
  initialCampaigns: Campaign[] = [],
  initialStats: ExchangeStats | null = null
): UseExchangeReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [stats, setStats] = useState<ExchangeStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch campaigns with filters
  const fetchCampaigns = useCallback(async (isRefresh = false, newPage = 1) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const searchFilters = {
        ...filters,
        page: newPage,
        limit: 12
      };

      if (searchTerm.trim()) {
        searchFilters.search = searchTerm.trim();
      }

      const result = await campaignAPI.getExchangeCampaigns(searchFilters);

      if (result.success && result.data) {
        if (newPage === 1) {
          setCampaigns(result.data.campaigns);
        } else {
          setCampaigns(prev => [...prev, ...result.data.campaigns]);
        }
        
        setHasMore(result.data.pagination.hasMore);
        setPage(newPage);

        // Update stats if refreshing
        if (isRefresh) {
          const statsResult = await campaignAPI.getExchangeStats();
          if (statsResult.success && statsResult.data) {
            setStats(statsResult.data);
          }
        }
      } else {
        setError(result.error || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
      setError('An error occurred while loading campaigns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, searchTerm]);

  // Prepare action - fetch initial data before user goes to TikTok
  const prepareAction = useCallback(async (
    campaignId: string, 
    actionType: string, 
    campaign: Campaign
  ): Promise<{ success: boolean; actionData?: ActionData; error?: string }> => {
    try {
      if (actionType === 'like') {
        // Fetch initial like count for video
        const video = campaign.videos[0];
        if (!video?.video_url) {
          return { success: false, error: 'Video URL not found' };
        }

        const response = await fetch(`/api/tiktok?action=getVideoInfo&videoLink=${encodeURIComponent(video.video_url)}`);
        const result = await response.json();

        if (result.success && result.data) {
          const actionData: ActionData = {
            initialData: {
              diggCount: result.data.diggCount,
              videoUrl: video.video_url
            }
          };
          return { success: true, actionData };
        } else {
          return { success: false, error: 'Failed to fetch video information' };
        }
      } else if (actionType === 'follow') {
        // For follow, just prepare with target username
        if (!campaign.creator_tiktok) {
          return { success: false, error: 'Creator TikTok username not available' };
        }

        const actionData: ActionData = {
          initialData: {
            targetUsername: campaign.creator_tiktok
          }
        };
        return { success: true, actionData };
      } else {
        return { success: false, error: `Action type "${actionType}" is not supported yet` };
      }
    } catch (error) {
      console.error('Prepare action error:', error);
      return { success: false, error: 'Failed to prepare action' };
    }
  }, []);

  // Claim credits after user performed action on TikTok
  const claimCredits = useCallback(async (
    campaignId: string, 
    actionType: string, 
    actionData: ActionData
  ): Promise<{ success: boolean; creditsEarned?: number; error?: string }> => {
    try {
      if (actionType === 'like') {
        // Fetch new like count and compare
        const { videoUrl, diggCount: initialDiggCount } = actionData.initialData || {};
        
        if (!videoUrl || initialDiggCount === undefined) {
          return { success: false, error: 'Missing initial video data' };
        }

        const response = await fetch(`/api/tiktok?action=getVideoInfo&videoLink=${encodeURIComponent(videoUrl)}`);
        const result = await response.json();

        if (result.success && result.data) {
          const newDiggCount = result.data.diggCount;

          if (newDiggCount > initialDiggCount) {
            // Like count increased, call API to award credits
            const claimResult = await campaignAPI.performExchangeAction(campaignId, 'like', {
              verified: true,
              initialCount: initialDiggCount,
              newCount: newDiggCount
            });

            if (claimResult.success && claimResult.data) {
              // Update local campaign data
              setCampaigns(prev => prev.map(campaign => {
                if (campaign.id === campaignId) {
                  return {
                    ...campaign,
                    current_count: campaign.current_count + 1,
                    remaining_credits: campaign.remaining_credits - campaign.credits_per_action
                  };
                }
                return campaign;
              }));

              return { 
                success: true, 
                creditsEarned: claimResult.data.credits_earned 
              };
            } else {
              return { success: false, error: claimResult.error || 'Failed to award credits' };
            }
          } else {
            return { success: false, error: 'No increase in like count detected. Please make sure you liked the video.' };
          }
        } else {
          return { success: false, error: 'Failed to verify like action' };
        }
      } else if (actionType === 'follow') {
        // Check if user is now in followers list
        const { targetUsername } = actionData.initialData || {};
        
        if (!targetUsername) {
          return { success: false, error: 'Target username not found' };
        }

        // Get current user profile to get their TikTok username
        const profileResult = await campaignAPI.getCurrentUserProfile();
        if (!profileResult.success || !profileResult.data?.tiktok_username) {
          return { success: false, error: 'User TikTok username not found' };
        }

        const userTikTokUsername = profileResult.data.tiktok_username;

        const response = await fetch(`/api/tiktok?action=getFollowers&id=${targetUsername}`);
        const result = await response.json();

        if (result.success && result.data?.responseData?.userList) {
          const followers = result.data.responseData.userList;
          const userFollowed = followers.some((follower: any) => 
            follower.user?.uniqueId === userTikTokUsername
          );

          if (userFollowed) {
            // User is in followers list, call API to award credits
            const claimResult = await campaignAPI.performExchangeAction(campaignId, 'follow', {
              verified: true,
              userFound: true
            });

            if (claimResult.success && claimResult.data) {
              // Update local campaign data
              setCampaigns(prev => prev.map(campaign => {
                if (campaign.id === campaignId) {
                  return {
                    ...campaign,
                    current_count: campaign.current_count + 1,
                    remaining_credits: campaign.remaining_credits - campaign.credits_per_action
                  };
                }
                return campaign;
              }));

              return { 
                success: true, 
                creditsEarned: claimResult.data.credits_earned 
              };
            } else {
              return { success: false, error: claimResult.error || 'Failed to award credits' };
            }
          } else {
            return { success: false, error: 'Follow action not detected. Please make sure you followed the account.' };
          }
        } else {
          return { success: false, error: 'Failed to verify follow action' };
        }
      } else {
        return { success: false, error: `Action type "${actionType}" is not supported yet` };
      }
    } catch (error) {
      console.error('Claim credits error:', error);
      return { success: false, error: 'An error occurred while claiming credits' };
    }
  }, []);

  // Load more campaigns
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCampaigns(false, page + 1);
    }
  }, [loading, hasMore, page, fetchCampaigns]);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchCampaigns(true, 1);
  }, [fetchCampaigns]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Update filters and reset pagination
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Update search term and reset pagination
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  // Effect to fetch campaigns when filters or search change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns(false, 1);
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm]);

  return {
    campaigns,
    stats,
    loading,
    refreshing,
    error,
    success,
    hasMore,
    page,
    filters,
    searchTerm,
    
    // Actions
    fetchCampaigns,
    setFilters: handleFiltersChange,
    setSearchTerm: handleSearchChange,
    loadMore,
    refresh,
    prepareAction,
    claimCredits,
    clearMessages,
  };
}

// Helper functions for exchange features
export const ExchangeHelpers = {
  // Calculate potential earnings for user level
  calculatePotentialEarnings: (campaigns: Campaign[]): number => {
    return campaigns.reduce((total, campaign) => {
      const actionsLeft = campaign.target_count - campaign.current_count;
      return total + (actionsLeft * campaign.credits_per_action);
    }, 0);
  },

  // Get campaigns by interaction type
  getCampaignsByType: (campaigns: Campaign[], type: string): Campaign[] => {
    return campaigns.filter(campaign => campaign.interaction_type === type);
  },

  // Get most profitable campaigns
  getMostProfitableCampaigns: (campaigns: Campaign[], limit: number = 10): Campaign[] => {
    return [...campaigns]
      .sort((a, b) => b.credits_per_action - a.credits_per_action)
      .slice(0, limit);
  },

  // Get newest campaigns
  getNewestCampaigns: (campaigns: Campaign[], limit: number = 10): Campaign[] => {
    return [...campaigns]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  // Filter by user affordability
  getAffordableCampaigns: (campaigns: Campaign[], userCredits: number): Campaign[] => {
    return campaigns.filter(campaign => userCredits >= campaign.credits_per_action);
  },

  // Get completion percentage for a campaign
  getCompletionPercentage: (campaign: Campaign): number => {
    return Math.round((campaign.current_count / campaign.target_count) * 100);
  },

  // Check if campaign is almost complete
  isAlmostComplete: (campaign: Campaign, threshold: number = 90): boolean => {
    const completion = ExchangeHelpers.getCompletionPercentage(campaign);
    return completion >= threshold;
  },

  // Format time ago for display
  formatTimeAgo: (dateString: string): string => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  },
};