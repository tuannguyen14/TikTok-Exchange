// Types
export interface CreateCampaignRequest {
    user_id: string;
    campaign_type: 'video' | 'follow';
    tiktok_video_id?: string;
    target_tiktok_username?: string;
    interaction_type?: 'view' | 'like' | 'comment';
    credits_per_action: number;
    target_count: number;
    total_credits: number;
}

export interface UpdateCampaignRequest {
    campaign_id: string;
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    credits_per_action?: number;
    target_count?: number;
}
