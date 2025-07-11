'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, UserPlus, Play, Coins, Clock, Users, Sparkles, Star, TrendingUp, Gift, LucideIcon } from 'lucide-react';

// TypeScript interfaces
interface Campaign {
  id: number;
  video_title: string;
  creator_username: string;
  creator_tiktok: string;
  video_url: string;
  thumbnail_url: string;
  interaction_type: 'like' | 'comment' | 'view' | 'follow';
  credits_per_action: number;
  target_count: number;
  current_count: number;
  remaining_credits: number;
  created_at: string;
}

interface FilterOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

const ExchangeHub: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userCredits, setUserCredits] = useState<number>(125);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data cho campaigns
  const mockCampaigns: Campaign[] = [
    {
      id: 1,
      video_title: "Thử thách dance trend mới siêu hot 🔥",
      creator_username: "dancequeen_vn",
      creator_tiktok: "@dancequeen",
      video_url: "https://example.com/video1",
      thumbnail_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=400&fit=crop",
      interaction_type: "like",
      credits_per_action: 2,
      target_count: 100,
      current_count: 23,
      remaining_credits: 154,
      created_at: "2024-07-11T10:30:00Z"
    },
    {
      id: 2,
      video_title: "Makeup tutorial cho beginners ✨",
      creator_username: "beauty_tips_2024",
      creator_tiktok: "@beautytips",
      video_url: "https://example.com/video2",
      thumbnail_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=400&fit=crop",
      interaction_type: "comment",
      credits_per_action: 3,
      target_count: 50,
      current_count: 12,
      remaining_credits: 114,
      created_at: "2024-07-11T09:15:00Z"
    },
    {
      id: 3,
      video_title: "Cooking hack siêu dễ mà ngon! 🍳",
      creator_username: "chef_young",
      creator_tiktok: "@chefyoung",
      video_url: "https://example.com/video3",
      thumbnail_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=400&fit=crop",
      interaction_type: "view",
      credits_per_action: 1,
      target_count: 200,
      current_count: 89,
      remaining_credits: 111,
      created_at: "2024-07-11T08:45:00Z"
    },
    {
      id: 4,
      video_title: "Outfit của ngày hôm nay 👗",
      creator_username: "fashion_lover",
      creator_tiktok: "@fashionlover",
      video_url: "https://example.com/video4",
      thumbnail_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop",
      interaction_type: "follow",
      credits_per_action: 5,
      target_count: 20,
      current_count: 7,
      remaining_credits: 65,
      created_at: "2024-07-11T07:20:00Z"
    },
    {
      id: 5,
      video_title: "Pet của mình cute không? 🐱",
      creator_username: "pet_lover_123",
      creator_tiktok: "@petlover",
      video_url: "https://example.com/video5",
      thumbnail_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=400&fit=crop",
      interaction_type: "like",
      credits_per_action: 2,
      target_count: 150,
      current_count: 67,
      remaining_credits: 166,
      created_at: "2024-07-11T06:30:00Z"
    },
    {
      id: 6,
      video_title: "Travel vlog Đà Lạt chill chill 🌸",
      creator_username: "travel_enthusiast",
      creator_tiktok: "@travelgram",
      video_url: "https://example.com/video6",
      thumbnail_url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73792?w=300&h=400&fit=crop",
      interaction_type: "comment",
      credits_per_action: 3,
      target_count: 75,
      current_count: 34,
      remaining_credits: 123,
      created_at: "2024-07-11T05:45:00Z"
    }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-[#FE2C55]" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-[#25F4EE]" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'like': return 'Like';
      case 'comment': return 'Comment';
      case 'view': return 'View';
      case 'follow': return 'Follow';
      default: return 'Action';
    }
  };

  const handleAction = async (campaignId: number, actionType: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        setUserCredits(prev => prev + campaign.credits_per_action);
        setCampaigns(prev => prev.map(c =>
          c.id === campaignId
            ? { ...c, current_count: c.current_count + 1, remaining_credits: c.remaining_credits - c.credits_per_action }
            : c
        ));
      }
      setLoading(false);
    }, 1500);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours}h trước`;
    return `${Math.floor(diffInHours / 24)}d trước`;
  };

  const filteredCampaigns = selectedFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.interaction_type === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
                  Exchange Hub
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Kiếm credits bằng cách tương tác</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] text-white px-4 py-2 rounded-full">
                <Coins className="w-4 h-4 animate-bounce" />
                <span className="font-semibold">{userCredits}</span>
                <span className="text-xs opacity-90">credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả', icon: Star },
            { key: 'view', label: 'Views', icon: Eye },
            { key: 'like', label: 'Likes', icon: Heart },
            { key: 'comment', label: 'Comments', icon: MessageCircle },
            { key: 'follow', label: 'Follows', icon: UserPlus }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${selectedFilter === filter.key
                  ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF4081] text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Credits Available</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaigns.reduce((sum, c) => sum + c.remaining_credits, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#25F4EE] to-[#00D2FF] rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2,847</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
              {/* Video Thumbnail */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={campaign.thumbnail_url}
                  alt={campaign.video_title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Credits Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Coins className="w-4 h-4" />
                  <span>+{campaign.credits_per_action}</span>
                </div>

                {/* Action Type Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  {getActionIcon(campaign.interaction_type)}
                  <span>{getActionText(campaign.interaction_type)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {campaign.video_title}
                </h3>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {campaign.creator_username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {campaign.creator_username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {campaign.creator_tiktok}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{campaign.current_count}/{campaign.target_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(campaign.current_count / campaign.target_count) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeAgo(campaign.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4" />
                    <span>{campaign.remaining_credits} còn lại</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAction(campaign.id, campaign.interaction_type)}
                  disabled={loading || campaign.remaining_credits < campaign.credits_per_action}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${loading || campaign.remaining_credits < campaign.credits_per_action
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {getActionIcon(campaign.interaction_type)}
                      <span>{getActionText(campaign.interaction_type)} để kiếm {campaign.credits_per_action} credits</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Không tìm thấy campaign nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hãy thử lọc theo loại tương tác khác hoặc quay lại sau nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeHub;