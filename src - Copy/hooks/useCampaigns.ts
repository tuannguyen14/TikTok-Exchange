// src/hooks/useCampaigns.ts
import { useState, useEffect, useCallback } from 'react';
import { CampaignsAPI, Campaign, CampaignStats, CampaignFilters, CreateCampaignData, UpdateCampaignData } from '@/lib/api/campaigns';

export interface UseCampaignsReturn {
  campaigns: Campaign[];
  stats: CampaignStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  createCampaign: (data: CreateCampaignData) => Promise<Campaign>;
  updateCampaign: (data: UpdateCampaignData) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<{ refunded: number }>;
  
  // Filters
  filters: CampaignFilters;
  setFilters: (filters: CampaignFilters) => void;
  
  // Pagination
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const api = new CampaignsAPI();

  const fetchCampaigns = useCallback(async (newFilters?: CampaignFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterToUse = newFilters || filters;
      const response = await api.getCampaigns(filterToUse);
      
      setCampaigns(response.campaigns);
      setPagination(response.pagination);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await api.getCampaignStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const createCampaign = useCallback(async (data: CreateCampaignData): Promise<Campaign> => {
    setLoading(true);
    setError(null);
    
    try {
      const newCampaign = await api.createCampaign(data);
      
      // Refresh campaigns and stats
      await fetchCampaigns();
      await fetchStats();
      
      return newCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCampaigns, fetchStats]);

  const updateCampaign = useCallback(async (data: UpdateCampaignData): Promise<Campaign> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCampaign = await api.updateCampaign(data);
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c.id === data.id ? updatedCampaign : c
      ));
      
      // Refresh stats
      await fetchStats();
      
      return updatedCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const deleteCampaign = useCallback(async (id: string): Promise<{ refunded: number }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.deleteCampaign(id);
      
      // Remove from local state
      setCampaigns(prev => prev.filter(c => c.id !== id));
      
      // Refresh stats
      await fetchStats();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      const newFilters = { ...filters, page: pagination.page + 1 };
      fetchCampaigns(newFilters);
    }
  }, [filters, pagination.page, pagination.totalPages, fetchCampaigns]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      const newFilters = { ...filters, page: pagination.page - 1 };
      fetchCampaigns(newFilters);
    }
  }, [filters, pagination.page, fetchCampaigns]);

  const setPage = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    fetchCampaigns(newFilters);
  }, [filters, fetchCampaigns]);

  // Initial fetch
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  return {
    campaigns,
    stats,
    loading,
    error,
    pagination,
    
    // Actions
    fetchCampaigns,
    fetchStats,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    // Filters
    filters,
    setFilters,
    
    // Pagination
    nextPage,
    prevPage,
    setPage,
  };
}