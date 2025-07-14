// src/app/[locale]/campaigns/types.ts
export interface Campaign {
    id: string;
    user_id: string;
    interaction_type: 'like' | 'comment' | 'follow' | 'view';
    credits_per_action: number;
    target_count: number;
    current_count: number;
    remaining_credits: number;
    total_credits: number;
    status: 'active' | 'paused' | 'completed';
    created_at: string;
    videos: {
      title: string;
      description?: string;
      category: string;
      video_url: string;
      tiktok_video_id: string;
    }[];
  }
  
  export interface CampaignStats {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    pausedCampaigns: number;
    totalCreditsSpent: number;
    totalActionsReceived: number;
  }