// src/hooks/useDashboard.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { campaignAPI } from '@/lib/api/campaigns';

interface Campaign {
  id: string;
  video_title?: string;
  interaction_type: 'like' | 'comment' | 'follow' | 'view';
  target_count: number;
  current_count: number;
  remaining_credits: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

interface DashboardStats {
  totalCredits: number;
  totalEarned: number;
  totalSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalActionsReceived: number;
}

interface UseDashboardReturn {
  campaigns: Campaign[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchDashboardData: () => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  updateCampaignStatus: (campaignId: string, status: 'active' | 'paused') => Promise<boolean>;
}

export function useDashboard(): UseDashboardReturn {
  const { profile, refreshProfile } = useAuth();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create fallback stats from profile
  const createFallbackStats = useCallback((profile: any): DashboardStats => ({
    totalCredits: profile?.credits || 0,
    totalEarned: profile?.total_earned || 0,
    totalSpent: profile?.total_spent || 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalActionsReceived: 0,
  }), []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch campaigns and stats in parallel
      const [campaignResult, statsResult] = await Promise.allSettled([
        campaignAPI.getUserCampaigns({ limit: 5 }),
        campaignAPI.getUserCampaignStats()
      ]);

      // Process campaigns result
      if (campaignResult.status === 'fulfilled' && campaignResult.value.success) {
        const campaignData = campaignResult.value.data?.campaigns || [];
        setCampaigns(campaignData);
      } else {
        console.error('Failed to fetch campaigns:', 
          campaignResult.status === 'rejected' 
            ? campaignResult.reason 
            : campaignResult.value.error
        );
        setCampaigns([]);
      }

      // Process stats result
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const statsData = statsResult.value.data;
        const dashboardStats: DashboardStats = {
          totalCredits: profile.credits || 0,
          totalEarned: profile.total_earned || 0,
          totalSpent: profile.total_spent || 0,
          activeCampaigns: statsData?.overview?.activeCampaigns || 0,
          completedCampaigns: statsData?.overview?.completedCampaigns || 0,
          totalActionsReceived: statsData?.overview?.totalActionsReceived || 0,
        };
        setStats(dashboardStats);
      } else {
        console.error('Failed to fetch stats:', 
          statsResult.status === 'rejected' 
            ? statsResult.reason 
            : statsResult.value.error
        );
        setStats(createFallbackStats(profile));
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data');
      setStats(createFallbackStats(profile));
    } finally {
      setLoading(false);
    }
  }, [profile, createFallbackStats]);

  // Refresh dashboard data (with loading state)
  const refreshDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Refresh user profile first
      await refreshProfile();
      
      // Then fetch dashboard data
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData, refreshProfile]);

  // Update campaign status
  const updateCampaignStatus = useCallback(async (
    campaignId: string, 
    status: 'active' | 'paused'
  ): Promise<boolean> => {
    try {
      const result = await campaignAPI.updateCampaign(campaignId, status);
      
      if (result.success) {
        // Update local state
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status }
            : campaign
        ));
        return true;
      } else {
        setError(result.error || 'Failed to update campaign');
        return false;
      }
    } catch (error) {
      console.error('Update campaign error:', error);
      setError('An error occurred while updating the campaign');
      return false;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile, fetchDashboardData]);

  return {
    campaigns,
    stats,
    loading,
    error,
    refreshing,
    fetchDashboardData,
    refreshDashboardData,
    updateCampaignStatus,
  };
}