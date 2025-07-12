// src/lib/api/profile.ts
import type { TikTokPreview, TikTokApiResponse } from '@/types/profile';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ProfileAPI {
  private baseUrl = '/api';

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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return {
          data: null,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          success: false
        };
      }

      const result: ApiResponse<T> = await response.json();

      return {
        data: result.data || null,
        error: result.success ? null : (result.error || result.message || 'Unknown error'),
        success: result.success
      };
    } catch (error) {
      console.error('Profile API call error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        success: false
      };
    }
  }

  // Verify TikTok username
  async verifyTikTokUsername(username: string) {
    return this.apiCall<TikTokPreview>(`/user/tiktok?username=${encodeURIComponent(username)}`);
  }

  // Connect TikTok account
  async connectTikTok(username: string) {
    return this.apiCall('/user/tiktok', {
      method: 'POST',
      body: JSON.stringify({ tiktok_username: username }),
    });
  }

  // Disconnect TikTok account
  async disconnectTikTok() {
    return this.apiCall('/user/tiktok', {
      method: 'DELETE',
    });
  }

  // Fetch TikTok stats with proper typing
  async fetchTikTokStats(username: string) {
    return this.apiCall<TikTokApiResponse>(`/tiktok?action=getProfile&id=${username}`);
  }

  async fetchTikTokProfile(username: string) {
    try {
      const response = await fetch(`/api/tiktok?action=getProfile&id=${username}`);
      const result = await response.json();

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            user: result.data.user,
            stats: result.data.stats
          }
        };
      }

      return { success: false, error: 'Profile not found' };
    } catch (error) {
      return { success: false, error: 'Failed to fetch profile' };
    }
  }
}

export const profileAPI = new ProfileAPI();
export default profileAPI;