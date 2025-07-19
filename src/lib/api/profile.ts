// src/lib/api/profile.ts
import { Profile, UpdateProfileRequest, ConnectTikTokRequest } from '@/types/profile';

export class ProfileApiClient {
  private baseUrl = '/api/profile';

  async getProfile(): Promise<Profile> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data.profile;
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<Profile> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.profile;
  }

  async connectTikTok(request: ConnectTikTokRequest): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/connect-tiktok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect TikTok');
    }

    const data = await response.json();
    return data.profile;
  }

  async disconnectTikTok(): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/disconnect-tiktok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disconnect TikTok');
    }

    const data = await response.json();
    return data.profile;
  }
}

export const profileApi = new ProfileApiClient();