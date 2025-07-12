'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Activity, 
  Coins, 
  Video, 
  Play, 
  Pause,
  Eye,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { campaignAPI } from '@/lib/api/campaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TikTokLinkPrompt from '@/components/dashboard/TikTokLinkPrompt';

// Types
interface DashboardStats {
  totalCredits: number;
  totalEarned: number;
  totalSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalActionsReceived: number;
}

interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'action_received' | 'credits_earned';
  title: string;
  description: string;
  credits?: number;
  timestamp: string;
  icon: React.ReactNode;
}

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

const Dashboard: React.FC = () => {
  const { profile, user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowTikTokPrompt, setShouldShowTikTokPrompt] = useState(false);

  // Check if user needs to link TikTok
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      if (!profile.tiktok_username) {
        setShouldShowTikTokPrompt(true);
      } else {
        setShouldShowTikTokPrompt(false);
      }
    }
  }, [authLoading, isAuthenticated, profile]);

  // Handle TikTok linking
  const handleLinkTikTok = () => {
    router.push(`/${locale}/profile?action=link-tiktok`);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !profile?.tiktok_username) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user campaigns
        const campaignsResult = await campaignAPI.getUserCampaigns({ limit: 5 });
        if (campaignsResult.success && campaignsResult.data) {
          setCampaigns(campaignsResult.data.campaigns);
        }

        // Fetch campaign stats
        const statsResult = await campaignAPI.getUserCampaignStats();
        if (statsResult.success && statsResult.data) {
          setStats({
            totalCredits: profile.credits,
            totalEarned: profile.total_earned,
            totalSpent: profile.total_spent,
            activeCampaigns: statsResult.data.overview.activeCampaigns,
            completedCampaigns: statsResult.data.overview.completedCampaigns,
            totalActionsReceived: statsResult.data.overview.totalActionsReceived,
          });

          // Transform recent actions to activity
          const activities: RecentActivity[] = statsResult.data.recentActions.map(action => ({
            id: action.id,
            type: 'action_received',
            title: `Received ${action.action_type}`,
            description: `+${action.credits_earned} credits earned`,
            credits: action.credits_earned,
            timestamp: action.created_at,
            icon: getActionIcon(action.action_type)
          }));

          setRecentActivity(activities);
        }

      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (!shouldShowTikTokPrompt) {
      fetchDashboardData();
    }
  }, [isAuthenticated, profile, shouldShowTikTokPrompt]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4" />;
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

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const result = await campaignAPI.updateCampaign(campaignId, newStatus);
      if (result.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus as any }
            : campaign
        ));
      }
    } catch (error) {
      console.error('Update campaign error:', error);
    }
  };

  // Show TikTok link prompt if no TikTok username
  if (shouldShowTikTokPrompt) {
    return <TikTokLinkPrompt onLinkTikTok={handleLinkTikTok} />;
  }

  // Show loading state
  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center space-x-3 p-6">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, @{profile?.tiktok_username}! Manage your campaigns and track your growth.
              </p>
            </div>
            
            <Button 
              onClick={() => router.push(`/${locale}/videos/new`)}
              className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Credits"
            value={stats?.totalCredits || 0}
            icon={<Coins className="w-6 h-6 text-yellow-500" />}
            trend={`+${stats?.totalEarned || 0} earned`}
            color="yellow"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={<Target className="w-6 h-6 text-blue-500" />}
            trend={`${stats?.completedCampaigns || 0} completed`}
            color="blue"
          />
          <StatsCard
            title="Total Actions"
            value={stats?.totalActionsReceived || 0}
            icon={<Activity className="w-6 h-6 text-green-500" />}
            trend="All time"
            color="green"
          />
          <StatsCard
            title="Credits Spent"
            value={stats?.totalSpent || 0}
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            trend="Total investment"
            color="purple"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Campaigns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-[#FE2C55]" />
                  <span>Recent Campaigns</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/${locale}/videos`)}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.length > 0 ? (
                  campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {campaign.video_title || 'Untitled Video'}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge 
                              variant="outline" 
                              className={getInteractionColor(campaign.interaction_type)}
                            >
                              {getActionIcon(campaign.interaction_type)}
                              <span className="ml-1 capitalize">{campaign.interaction_type}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {campaign.current_count}/{campaign.target_count}
                            </span>
                          </div>
                          <Progress 
                            value={(campaign.current_count / campaign.target_count) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {campaign.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                        >
                          {campaign.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No campaigns yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => router.push(`/${locale}/videos/new`)}
                      className="text-[#FE2C55] hover:text-[#FF4081] mt-2"
                    >
                      Create your first campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#25F4EE]" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/${locale}/exchange`)}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Earning Credits
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/${locale}/videos/new`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/${locale}/profile`)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.credits && (
                        <Badge variant="secondary" className="text-xs">
                          +{activity.credits}
                        </Badge>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: 'yellow' | 'blue' | 'green' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    yellow: 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
    blue: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
    green: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
    purple: 'from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-0 shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </h3>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;