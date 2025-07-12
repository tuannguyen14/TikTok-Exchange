// src/hooks/useTikTok.ts
import { useState, useCallback } from 'react';

interface TikTokUser {
  uniqueId: string;
  nickname: string;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  verified: boolean;
  privateAccount: boolean;
}

interface TikTokStats {
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
}

interface TikTokProfile {
  user: TikTokUser;
  stats: TikTokStats;
}

// Cache để tránh fetch liên tục
const tiktokCache = new Map<string, { data: TikTokProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTikTok = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (username: string): Promise<TikTokProfile | null> => {
    try {
      // Check cache first
      const cached = tiktokCache.get(username);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tiktok?action=getProfile&id=${username}`);
      const result = await response.json();

      if (result.success && result.data) {
        const profileData = result.data as TikTokProfile;
        
        // Cache the result
        tiktokCache.set(username, {
          data: profileData,
          timestamp: Date.now()
        });

        return profileData;
      } else {
        setError('Profile not found or private');
        return null;
      }
    } catch (err) {
      console.error('TikTok fetch error:', err);
      setError('Failed to fetch TikTok profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCachedProfile = useCallback((username: string): TikTokProfile | null => {
    const cached = tiktokCache.get(username);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const clearCache = useCallback((username?: string) => {
    if (username) {
      tiktokCache.delete(username);
    } else {
      tiktokCache.clear();
    }
  }, []);

  return { 
    fetchProfile, 
    getCachedProfile, 
    clearCache, 
    loading, 
    error 
  };
};