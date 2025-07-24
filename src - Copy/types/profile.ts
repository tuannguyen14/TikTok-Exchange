// src/types/profile.ts
export interface Profile {
  id: string;
  email: string;
  tiktok_username: string | null;
  credits: number;
  total_earned: number;
  total_spent: number;
  status: 'active' | 'banned' | 'pending' | 'inactive';
  tiktok_stats: TikTokStats | null;
  notification_settings: NotificationSettings;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface TikTokStats {
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
  friendCount: number;
}

// TikTok API Response structure (from your existing API)
export interface TikTokApiUser {
  id: string;
  shortId: string;
  uniqueId: string;
  nickname: string;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  verified: boolean;
  followerCount?: number;
  followingCount?: number;
  heartCount?: number;
  videoCount?: number;
}

export interface TikTokApiStats {
  followerCount: number;
  followingCount: number;
  heart: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
  friendCount: number;
}

export interface TikTokApiResponse {
  success: boolean;
  data: {
    user: TikTokApiUser;
    stats: TikTokApiStats;
    statsV2: TikTokApiStats;
    itemList: any[];
  };
  error?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  campaigns: boolean;
  rewards: boolean;
}

export interface UpdateProfileRequest {
  tiktok_username?: string;
  notification_settings?: NotificationSettings;
}

export interface ConnectTikTokRequest {
  username: string;
}