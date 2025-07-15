// src/types/campaign.ts
export interface Campaign {
  id: string
  user_id: string
  video_id: string
  interaction_type: 'like' | 'comment' | 'follow' | 'view'
  credits_per_action: number
  target_count: number
  current_count: number
  total_credits: number
  remaining_credits: number
  status: 'active' | 'paused' | 'completed'
  expires_at?: string
  created_at: string
  updated_at: string

  // Joined data from other tables
  creator_email?: string
  creator_tiktok?: string
  video_title?: string
  video_url?: string
  category?: string,
  videos?: Video[]
}

export interface Video {
  id: string
  user_id: string
  tiktok_video_id: string
  video_url: string
  title?: string
  description?: string
  category?: string
  tiktok_stats?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CampaignAction {
  id: string
  user_id: string
  campaign_id: string
  video_id: string
  action_type: 'like' | 'comment' | 'follow' | 'view'
  credits_earned: number
  status: 'completed' | 'pending' | 'failed'
  proof_data?: any
  created_at: string
}

export interface CreateCampaignRequest {
  video_url: string
  video_title?: string
  description?: string
  category?: string
  interaction_type: 'like' | 'comment' | 'follow' | 'view'
  target_count: number
  credits_per_action: number
}

export interface PerformActionRequest {
  action_type: 'like' | 'comment' | 'follow' | 'view'
  proof_data?: any
}

export interface CampaignStats {
  total_campaigns: number
  active_campaigns: number
  completed_campaigns: number
  total_credits_spent: number
  total_actions_received: number
  paused_campaigns: number
}

export interface UserCampaignAnalytics {
  campaign_id: string
  views: number
  likes: number
  comments: number
  follows: number
  total_actions: number
  credits_spent: number
  completion_rate: number
  created_at: string
}