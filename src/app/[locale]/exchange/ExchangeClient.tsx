// src/app/[locale]/exchange/ExchangeClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Filter, 
  Search,
  TrendingUp,
  Users,
  Target,
  Coins
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExchangeFilters from '@/components/exchange/ExchangeFilters';
import CampaignCard from '@/components/exchange/CampaignCard';
import ExchangeStats from '@/components/exchange/ExchangeStats';
import { campaignAPI } from '@/lib/api/campaigns';
import type { Profile } from '@/types/auth';

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

interface ExchangeClientProps {
  locale: string;
  profile: Profile;
  initialCampaigns: Campaign[];
  stats: ExchangeStats;
}

interface Filters {
  interaction_type?: 'like' | 'comment' | 'follow' | 'view';
  category?: string;
  min_credits?: number;
  max_credits?: number;
  search?: string;
}

export default function ExchangeClient({
  locale,
  profile,
  initialCampaigns,
  stats: initialStats
}: ExchangeClientProps) {
  const t = useTranslations('Exchange');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [stats, setStats] = useState<ExchangeStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch campaigns with filters
  const fetchCampaigns = async (isRefresh = false, newPage = 1) => {
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
        // Simple search implementation - in real app might search by title/description
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
  };

  // Apply filters
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Load more campaigns
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCampaigns(false, page + 1);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchCampaigns(true, 1);
  };

  // Perform action on campaign
  const handlePerformAction = async (campaignId: string, actionType: string) => {
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

        // Update user's credits in profile (would need to refresh from parent)
        // For now, just show success message
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Perform action error:', error);
      setError('An error occurred while performing the action');
    }
  };

  // Effect to fetch campaigns when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns(false, 1);
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ExchangeStats stats={stats} />
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-700">
              {profile.credits} credits
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExchangeFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaigns Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading && campaigns.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CampaignCard
                      campaign={campaign}
                      onPerformAction={handlePerformAction}
                      userCredits={profile.credits}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Campaigns'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('empty.title')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('empty.description')}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}