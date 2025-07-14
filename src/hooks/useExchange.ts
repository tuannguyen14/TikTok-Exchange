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
  performAction: (campaignId: string, actionType: string) => Promise<void>;
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

  // Perform action on campaign
  const performAction = useCallback(async (campaignId: string, actionType: string) => {
    try {
      setError(null);
      setSuccess(null);

      const result = await campaignAPI.performExchangeAction(
        campaignId, 
        actionType as 'like' | 'comment' | 'follow' | 'view'
      );

      if (result.success && result.data) {
        setSuccess(`Action completed! +${result.data.credits_earned} credits earned`);
        
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

        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Perform action error:', error);
      setError('An error occurred while performing the action');
    }
  }, []);

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
    performAction,
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