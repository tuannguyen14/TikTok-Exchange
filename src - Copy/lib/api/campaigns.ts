// src/lib/api/campaigns.ts
export interface Campaign {
  id: string;
  user_id: string;
  campaign_type: 'video' | 'follow';
  tiktok_video_id?: string;
  target_tiktok_username?: string;
  interaction_type?: 'view' | 'like' | 'comment';
  credits_per_action: number;
  target_count: number;
  current_count: number;
  total_credits: number;
  remaining_credits: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  totalCreditsSpent: number;
  totalActionsReceived: number;
  byType: {
    video: number;
    follow: number;
  };
}

export interface CreateCampaignData {
  campaign_type: 'video' | 'follow';
  tiktok_video_id?: string;
  target_tiktok_username?: string;
  interaction_type?: 'view' | 'like' | 'comment';
  credits_per_action: number;
  target_count: number;
}

export interface UpdateCampaignData {
  id: string;
  status?: Campaign['status'];
  credits_per_action?: number;
}

export interface CampaignFilters {
  status?: Campaign['status'];
  type?: Campaign['campaign_type'];
  page?: number;
  limit?: number;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CampaignsAPI {
  private baseURL = '/api/campaigns';

  async getCampaigns(filters: CampaignFilters = {}): Promise<CampaignListResponse> {
    const params = new URLSearchParams({
      action: 'list',
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
    });

    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch campaigns');
    }

    const result = await response.json();
    return result.data;
  }

  async getCampaignStats(): Promise<CampaignStats> {
    const response = await fetch(`${this.baseURL}?action=stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch campaign stats');
    }

    const result = await response.json();
    return result.data;
  }

  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create campaign');
    }

    const result = await response.json();
    return result.data;
  }

  async updateCampaign(data: UpdateCampaignData): Promise<Campaign> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update campaign');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteCampaign(id: string): Promise<{ refunded: number }> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete campaign');
    }

    const result = await response.json();
    return result.data;
  }
}