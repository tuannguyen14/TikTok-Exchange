// src/lib/api/campaigns.ts
import { Campaign, CreateCampaignRequest, PerformActionRequest } from '@/types/campaign'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginationParams {
  page?: number
  limit?: number
}

interface CampaignFilters extends PaginationParams {
  interaction_type?: 'like' | 'comment' | 'follow' | 'view'
  category?: string
  min_credits?: number
  max_credits?: number
  search?: string
}

interface UserCampaignFilters extends PaginationParams {
  status?: 'active' | 'paused' | 'completed'
  interaction_type?: 'like' | 'comment' | 'follow' | 'view'
}

interface UserActionFilters extends PaginationParams {
  action_type?: 'like' | 'comment' | 'follow' | 'view'
}

class CampaignAPI {
  private baseUrl = '/api'

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        return {
          data: null,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          success: false
        }
      }

      const result: ApiResponse<T> = await response.json()
      
      return {
        data: result.data || null,
        error: result.success ? null : (result.error || result.message || 'Unknown error'),
        success: result.success
      }
    } catch (error) {
      console.error('API call error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        success: false
      }
    }
  }

  // Get available campaigns for interaction
  async getAvailableCampaigns(filters: CampaignFilters = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.apiCall<{
      campaigns: Campaign[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
      }
    }>(`/campaigns?${searchParams.toString()}`)
  }

  // Get exchange campaigns (with proper endpoint)
  async getExchangeCampaigns(filters: CampaignFilters = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.apiCall<{
      campaigns: Campaign[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
      }
    }>(`/exchange?${searchParams.toString()}`)
  }

  // Get exchange stats
  async getExchangeStats() {
    return this.apiCall<{
      activeCampaigns: number
      totalCreditsAvailable: number
      activeUsers: number
    }>('/exchange/stats')
  }

  // Get specific campaign by ID
  async getCampaign(campaignId: string) {
    return this.apiCall<Campaign>(`/campaigns/${campaignId}`)
  }

  // Create new campaign
  async createCampaign(campaignData: CreateCampaignRequest) {
    return this.apiCall<{ campaign_id: string; message: string }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    })
  }

  // Update campaign (pause/resume)
  async updateCampaign(campaignId: string, status: 'active' | 'paused') {
    return this.apiCall<Campaign>(`/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Delete campaign
  async deleteCampaign(campaignId: string) {
    return this.apiCall<{ message: string }>(`/campaigns/${campaignId}`, {
      method: 'DELETE',
    })
  }

  // Perform action on campaign (old method, kept for backward compatibility)
  async performAction(campaignId: string, actionData: PerformActionRequest) {
    return this.apiCall<{ credits_earned: number; message: string }>(
      `/campaigns/${campaignId}/actions`,
      {
        method: 'POST',
        body: JSON.stringify(actionData),
      }
    )
  }

  // New method for exchange actions with verification data
  async performExchangeAction(
    campaignId: string, 
    actionType: 'like' | 'comment' | 'follow' | 'view',
    verificationData?: any
  ) {
    return this.apiCall<{ credits_earned: number; message: string }>(
      '/exchange/action',
      {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId,
          action_type: actionType,
          proof_data: verificationData
        }),
      }
    )
  }

  // Get current user profile (for TikTok username)
  async getCurrentUserProfile() {
    return this.apiCall<{
      id: string
      email: string
      tiktok_username?: string
      credits: number
    }>('/user/profile')
  }

  // Get campaign action history (for campaign owners)
  async getCampaignActions(campaignId: string, filters: PaginationParams = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.apiCall<Array<{
      id: string
      user_id: string
      action_type: string
      credits_earned: number
      created_at: string
      profiles: { email: string }
    }>>(`/campaigns/${campaignId}/actions?${searchParams.toString()}`)
  }

  // Get user's own campaigns
  async getUserCampaigns(filters: UserCampaignFilters = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.apiCall<{
      campaigns: Campaign[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
      }
    }>(`/user/campaigns?${searchParams.toString()}`)
  }

  // Get user campaign statistics
  async getUserCampaignStats() {
    return this.apiCall<{
      overview: {
        totalCampaigns: number
        activeCampaigns: number
        completedCampaigns: number
        pausedCampaigns: number
        totalCreditsSpent: number
        totalActionsReceived: number
      }
      interactionBreakdown: Record<string, {
        count: number
        actions: number
        credits: number
      }>
      recentActions: Array<{
        id: string
        action_type: string
        credits_earned: number
        created_at: string
      }>
    }>('/user/campaigns/stats')
  }

  // Get user's action history
  async getUserActions(filters: UserActionFilters = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.apiCall<{
      actions: Array<{
        id: string
        action_type: string
        credits_earned: number
        status: string
        created_at: string
        campaigns: {
          id: string
          interaction_type: string
          user_id: string
          videos: {
            id: string
            title: string
            video_url: string
            category: string
          }
        }
        videos: {
          id: string
          title: string
          video_url: string
          category: string
        }
      }>
      stats: {
        totalCreditsEarned: number
        totalActions: number
        actionBreakdown: Record<string, {
          count: number
          credits: number
        }>
      }
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
      }
    }>(`/user/actions?${searchParams.toString()}`)
  }

  // TikTok API helpers for action verification
  async fetchTikTokVideoInfo(videoUrl: string) {
    try {
      const response = await fetch(`/api/tiktok?action=getVideoInfo&videoLink=${encodeURIComponent(videoUrl)}`)
      return await response.json()
    } catch (error) {
      console.error('TikTok video info fetch error:', error)
      return { success: false, error: 'Failed to fetch video info' }
    }
  }

  async fetchTikTokFollowers(username: string) {
    try {
      const response = await fetch(`/api/tiktok?action=getFollowers&id=${encodeURIComponent(username)}`)
      return await response.json()
    } catch (error) {
      console.error('TikTok followers fetch error:', error)
      return { success: false, error: 'Failed to fetch followers' }
    }
  }
}

// Create singleton instance
export const campaignAPI = new CampaignAPI()

// Helper functions for common operations
export const CampaignHelpers = {
  // Validate TikTok URL
  isValidTikTokUrl: (url: string): boolean => {
    const regex = /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/
    return regex.test(url)
  },

  // Extract TikTok username from URL
  extractTikTokUsername: (url: string): string | null => {
    try {
      const regex = /tiktok\.com\/@([^\/]+)\/video/
      const match = url.match(regex)
      return match ? match[1] : null
    } catch {
      return null
    }
  },

  // Get credit requirements for action types
  getCreditsForAction: (actionType: 'view' | 'like' | 'comment' | 'follow'): number => {
    const creditMap = {
      view: 1,
      like: 2,
      comment: 3,
      follow: 5
    }
    return creditMap[actionType]
  },

  // Calculate campaign cost
  calculateCampaignCost: (targetCount: number, actionType: 'view' | 'like' | 'comment' | 'follow'): number => {
    const creditsPerAction = CampaignHelpers.getCreditsForAction(actionType)
    return targetCount * creditsPerAction
  },

  // Format action type for display
  formatActionType: (actionType: string): string => {
    const actionMap = {
      view: 'View',
      like: 'Like', 
      comment: 'Comment',
      follow: 'Follow'
    }
    return actionMap[actionType as keyof typeof actionMap] || actionType
  },

  // Get action icon/emoji
  getActionIcon: (actionType: string): string => {
    const iconMap = {
      view: '👁️',
      like: '❤️',
      comment: '💬',
      follow: '👥'
    }
    return iconMap[actionType as keyof typeof iconMap] || '⭐'
  },

  // Calculate completion percentage
  getCompletionPercentage: (currentCount: number, targetCount: number): number => {
    if (targetCount === 0) return 0
    return Math.min(Math.round((currentCount / targetCount) * 100), 100)
  },

  // Check if campaign is expired
  isCampaignExpired: (expiresAt?: string): boolean => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  },

  // Format campaign status for display
  formatCampaignStatus: (status: string): { label: string; color: string } => {
    const statusMap = {
      active: { label: 'Active', color: 'green' },
      paused: { label: 'Paused', color: 'yellow' },
      completed: { label: 'Completed', color: 'blue' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' }
  },

  // Check if action type is supported for verification
  isActionTypeSupported: (actionType: string): boolean => {
    return ['like', 'follow'].includes(actionType)
  },

  // Get action verification instructions
  getActionInstructions: (actionType: string, targetUsername?: string): string => {
    switch (actionType) {
      case 'like':
        return '1. Click "Go to TikTok" and like the video\n2. Come back and click "Claim Credits"'
      case 'follow':
        return `1. Click "Go to TikTok" and follow @${targetUsername}\n2. Come back and click "Claim Credits"`
      case 'comment':
        return 'Comment verification is coming soon'
      case 'view':
        return 'View verification is coming soon'
      default:
        return 'Action verification not available'
    }
  }
}

export default campaignAPI