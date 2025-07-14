// src/app/[locale]/exchange/ExchangeClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Filter, 
  Search,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExchangeFilters from '@/components/exchange/ExchangeFilters';
import ExchangeStats from '@/components/exchange/ExchangeStats';
import { useExchange } from '@/hooks/useExchange';
import type { Profile } from '@/types/auth';

// Import the updated CampaignCard
const CampaignCard = React.lazy(() => import('@/components/exchange/CampaignCard'));

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

export default function ExchangeClient({
  locale,
  profile,
  initialCampaigns,
  stats: initialStats
}: ExchangeClientProps) {
  const t = useTranslations('Exchange');
  
  const {
    campaigns,
    stats,
    loading,
    refreshing,
    error,
    success,
    hasMore,
    filters,
    searchTerm,
    setFilters,
    setSearchTerm,
    loadMore,
    refresh,
    clearMessages
  } = useExchange(initialCampaigns, initialStats);

  const [showFilters, setShowFilters] = React.useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
          <ExchangeStats stats={stats || initialStats} />
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
                onChange={handleSearch}
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
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {profile.credits} credits
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
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
                onFiltersChange={setFilters}
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
                <AlertCircle className="h-4 w-4" />
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

        {/* TikTok Connection Warning */}
        {!profile.tiktok_username && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to connect your TikTok account to participate in campaigns. 
                <Button 
                  variant="link" 
                  className="p-0 ml-1 h-auto text-orange-600 hover:text-orange-700"
                  onClick={() => window.location.href = `/${locale}/profile?action=link-tiktok`}
                >
                  Connect now
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <React.Suspense fallback={<div>Loading campaigns...</div>}>
                  {campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CampaignCard
                        campaign={campaign}
                        userCredits={profile.credits}
                        userTikTokUsername={profile.tiktok_username}
                      />
                    </motion.div>
                  ))}
                </React.Suspense>
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
                  No campaigns found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {Object.keys(filters).length > 0 || searchTerm
                    ? "Try adjusting your filters or search terms"
                    : "There are no active campaigns at the moment"}
                </p>
                {(Object.keys(filters).length > 0 || searchTerm) && (
                  <Button
                    onClick={() => {
                      setFilters({});
                      setSearchTerm('');
                      clearMessages();
                    }}
                    variant="outline"
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}