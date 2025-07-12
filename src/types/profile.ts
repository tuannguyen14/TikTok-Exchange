// src/types/profile.ts
export interface ProfileStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  totalActionsPerformed: number;
  totalActionsReceived: number;
  joinDate: string;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus';
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
}

export interface TikTokStats {
  followers?: number;
  following?: number;
  likes?: number;
  videos?: number;
  verified?: boolean;
}

export interface TikTokPreview {
  username: string;
  nickname: string;
  avatar: string;
  verified: boolean;
  privateAccount: boolean;
  signature: string;
  stats: {
    followers: number;
    following: number;
    likes: number;
    videos: number;
  };
}

export interface ProfileFormData {
  email: string;
  avatar_url: string;
  tiktok_username: string;
}

// TikTok API Response Types
export interface TikTokApiUser {
  id: string;
  uniqueId: string;
  nickname: string;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  verified: boolean;
  privateAccount: boolean;
}

export interface TikTokApiStats {
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
  friendCount: number;
}

export interface TikTokApiResponse {
  user: TikTokApiUser;
  stats: TikTokApiStats;
}