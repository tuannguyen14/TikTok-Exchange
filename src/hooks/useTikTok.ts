// hooks/use-tiktok.ts

import { useState, useEffect, useCallback } from 'react';
import {
  tiktokApi,
  TikTokUserInfo,
  TikTokVideoInfo,
  FollowsListResponse
} from '@/lib/api/tiktok';

// Generic hook state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook for getting user profile
export function useTikTokProfile(username: string | null) {
  const [state, setState] = useState<ApiState<TikTokUserInfo>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getProfile(username);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to fetch profile'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    ...state,
    refetch: fetchProfile
  };
}

// Hook for getting user followers
export function useTikTokFollowers(username: string | null) {
  const [state, setState] = useState<ApiState<{
    followers: Array<any>;
    total: number;
    responseData: FollowsListResponse | null;
  }>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchFollowers = useCallback(async () => {
    if (!username) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getFollowers(username);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to fetch followers'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [username]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return {
    ...state,
    refetch: fetchFollowers
  };
}

// Hook for getting video information
export function useTikTokVideo(videoLink: string | null) {
  const [state, setState] = useState<ApiState<TikTokVideoInfo>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchVideoInfo = useCallback(async () => {
    if (!videoLink) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getVideoInfo(videoLink);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to fetch video info'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [videoLink]);

  useEffect(() => {
    fetchVideoInfo();
  }, [fetchVideoInfo]);

  return {
    ...state,
    refetch: fetchVideoInfo
  };
}

// Hook for batch profile fetching
export function useTikTokMultipleProfiles(usernames: string[]) {
  const [state, setState] = useState<ApiState<Array<{ username: string; data: any }>>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchMultipleProfiles = useCallback(async () => {
    if (usernames.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getMultipleProfiles(usernames);

      if (response.success) {
        setState({
          data: response.results,
          loading: false,
          error: null
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: 'Failed to fetch multiple profiles'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [usernames]);

  useEffect(() => {
    fetchMultipleProfiles();
  }, [fetchMultipleProfiles]);

  return {
    ...state,
    refetch: fetchMultipleProfiles
  };
}

// Hook for manual API calls (imperative)
export function useTikTokApi() {
  const [loading, setLoading] = useState(false);

  const getProfile = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getProfile(username);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getFollowers(username);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVideoInfo = useCallback(async (videoLink: string) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getVideoInfo(videoLink);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserExists = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const exists = await tiktokApi.userExists(username);
      return exists;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFormattedStats = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const stats = await tiktokApi.getFormattedStats(username);
      return stats;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getProfile,
    getFollowers,
    getVideoInfo,
    checkUserExists,
    getFormattedStats,
    // Utility methods
    extractUsername: tiktokApi.extractUsername,
    extractVideoId: tiktokApi.extractVideoId,
    formatCount: tiktokApi.formatCount
  };
}