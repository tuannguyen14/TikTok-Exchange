// lib/api/exchange.ts

export interface Campaign {
    id: string;
    user_id: string;
    campaign_type: 'video' | 'follow';
    tiktok_video_id?: string;
    target_tiktok_username?: string; // Used for both video and follow campaigns
    interaction_type?: 'view' | 'like' | 'comment';
    credits_per_action: number;
    target_count: number;
    current_count: number;
    total_credits: number;
    remaining_credits: number;
    status: 'active' | 'paused' | 'completed';
    created_at: string;
    updated_at: string;
    // Additional fields from TikTok API
    video_info?: {
        diggCount: number;
        shareCount: number;
        commentCount: number;
        playCount: number;
        collectCount: string;
        tiktokID: string;
        videoID: string;
        url: string;
    };
    user_info?: {
        uniqueId: string;
        nickname: string;
        avatarThumb: string;
        followerCount: number;
        followingCount: number;
        verified: boolean;
    };
}

export interface Action {
    id: string;
    user_id: string;
    campaign_id: string;
    action_type: 'view' | 'like' | 'comment' | 'follow';
    credits_earned: number;
    status: 'completed' | 'pending' | 'rejected';
    proof_data?: any;
    created_at: string;
}

export interface PerformActionRequest {
    campaignId: string;
    actionType: 'view' | 'like' | 'comment' | 'follow';
    proofData?: any;
}

export interface PerformActionResponse {
    success: boolean;
    data?: {
        action: Action;
        creditsEarned: number;
        newBalance: number;
    };
    error?: string;
}

export interface VerifyActionRequest {
    campaignId: string;
    actionType: 'view' | 'like' | 'comment' | 'follow';
    videoLink?: string;
    targetUsername?: string;
}

export interface VerifyActionResponse {
    success: boolean;
    data?: {
        verified: boolean;
        previousCount?: number;
        currentCount?: number;
        isFollowing?: boolean;
    };
    error?: string;
}

class ExchangeApi {
    private baseUrl = '/api/exchange';

    async getCampaigns(
        type?: 'video' | 'follow',
        status?: 'active' | 'completed',
        sortBy?: 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits'
    ): Promise<{ success: boolean; data?: Campaign[]; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (status) params.append('status', status);
            if (sortBy) params.append('sortBy', sortBy);

            const response = await fetch(`${this.baseUrl}/campaigns?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async getCampaignById(id: string): Promise<{ success: boolean; data?: Campaign; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/campaigns/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching campaign:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async verifyAction(request: VerifyActionRequest): Promise<VerifyActionResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/verify-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error verifying action:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async performAction(request: PerformActionRequest): Promise<PerformActionResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/perform-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error performing action:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async getUserActions(
        campaignId?: string,
        actionType?: 'view' | 'like' | 'comment' | 'follow',
        status?: 'completed' | 'pending' | 'rejected'
    ): Promise<{ success: boolean; data?: Action[]; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (campaignId) params.append('campaignId', campaignId);
            if (actionType) params.append('actionType', actionType);
            if (status) params.append('status', status);

            const response = await fetch(`${this.baseUrl}/actions?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user actions:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Utility methods
    formatCredits(credits: number): string {
        return credits.toLocaleString();
    }

    formatCount(count: number): string {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    getProgressPercentage(current: number, target: number): number {
        return Math.min((current / target) * 100, 100);
    }

    canPerformAction(campaign: Campaign, userActions: Action[]): boolean {
        // Check if campaign is active
        if (campaign.status !== 'active') return false;

        // Check if has remaining credits
        if (campaign.remaining_credits <= 0) return false;

        // Check if target is reached
        if (campaign.current_count >= campaign.target_count) return false;

        // Check if user has already performed this action
        const actionType = campaign.campaign_type === 'follow' ? 'follow' : campaign.interaction_type;
        const hasPerformed = userActions.some(
            action => action.campaign_id === campaign.id && action.action_type === actionType
        );

        return !hasPerformed;
    }
}

export const exchangeApi = new ExchangeApi();