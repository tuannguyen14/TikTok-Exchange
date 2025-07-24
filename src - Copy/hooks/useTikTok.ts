// hooks/use-tiktok.ts

import { useState, useEffect, useCallback } from 'react';
import {
  tiktokApi,
  TikTokUserInfo,
  TikTokPostDetail,
  FollowsListResponse,
  PostDetailResponse
} from '@/lib/api/tiktok';

// Generic hook state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook for getting user profile
export function useTikTokProfile(uniqueId: string | null) {
  const [state, setState] = useState<ApiState<TikTokUserInfo>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchProfile = useCallback(async () => {
    if (!uniqueId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getProfile(uniqueId);

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
  }, [uniqueId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    ...state,
    refetch: fetchProfile
  };
}

// Hook for getting user followers
export function useTikTokFollowers(
  uniqueId: string | null,
  secUid?: string,
  count: number = 30,
  minCursor: number = 0
) {
  const [state, setState] = useState<ApiState<{
    followers: Array<{
      user: any;
      stats: any;
    }>;
    total: number;
    responseData: FollowsListResponse | null;
  }>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchFollowers = useCallback(async () => {
    if (!uniqueId && !secUid) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getFollowers(uniqueId || undefined, secUid, count, minCursor);

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
  }, [uniqueId, secUid, count, minCursor]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return {
    ...state,
    refetch: fetchFollowers
  };
}

// Hook for getting post detail (replacing liked posts)
export function useTikTokPostDetail(videoId: string | null) {
  const [state, setState] = useState<ApiState<PostDetailResponse>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchPostDetail = useCallback(async () => {
    if (!videoId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getPostDetail(videoId);

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
          error: response.error || 'Failed to fetch post detail'
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [videoId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  return {
    ...state,
    refetch: fetchPostDetail
  };
}

// Hook for batch profile fetching
export function useTikTokMultipleProfiles(uniqueIds: string[]) {
  const [state, setState] = useState<ApiState<Array<{ uniqueId: string; data: any }>>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchMultipleProfiles = useCallback(async () => {
    if (uniqueIds.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tiktokApi.getMultipleProfiles(uniqueIds);

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
  }, [uniqueIds]);

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

  const getProfile = useCallback(async (uniqueId: string) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getProfile(uniqueId);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (
    uniqueId?: string,
    secUid?: string,
    count: number = 30,
    minCursor: number = 0
  ) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getFollowers(uniqueId, secUid, count, minCursor);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostDetail = useCallback(async (videoId: string) => {
    setLoading(true);
    try {
      const response = await tiktokApi.getPostDetail(videoId);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserExists = useCallback(async (uniqueId: string) => {
    setLoading(true);
    try {
      const exists = await tiktokApi.userExists(uniqueId);
      return exists;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFormattedStats = useCallback(async (uniqueId: string) => {
    setLoading(true);
    try {
      const stats = await tiktokApi.getFormattedStats(uniqueId);
      return stats;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSecUid = useCallback(async (uniqueId: string) => {
    setLoading(true);
    try {
      const secUid = await tiktokApi.getUserSecUid(uniqueId);
      return secUid;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getProfile,
    getFollowers,
    getPostDetail,
    checkUserExists,
    getFormattedStats,
    getUserSecUid,
    // Utility methods
    extractUsername: tiktokApi.extractUsername,
    extractVideoId: tiktokApi.extractVideoId,
    formatCount: tiktokApi.formatCount,
    getVideoThumbnail: tiktokApi.getVideoThumbnail,
    getVideoPlayUrl: tiktokApi.getVideoPlayUrl,
    getVideoDownloadUrl: tiktokApi.getVideoDownloadUrl,
    formatCreateTime: tiktokApi.formatCreateTime,
    formatDuration: tiktokApi.formatDuration
  };
}

// Hook for paginated followers with infinite scroll support
export function useTikTokFollowersPaginated(uniqueId: string | null, pageSize: number = 30) {
  const [followers, setFollowers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [minCursor, setMinCursor] = useState(0);

  const loadMore = useCallback(async () => {
    if (!uniqueId || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await tiktokApi.getFollowers(uniqueId, undefined, pageSize, minCursor);

      if (response.success && response.data) {
        const newFollowers = response.data.followers;
        setFollowers(prev => [...prev, ...newFollowers]);

        // Update pagination
        if (response.data.responseData) {
          setHasMore(response.data.responseData.hasMore);
          setMinCursor(response.data.responseData.maxCursor);
        } else {
          setHasMore(false);
        }
      } else {
        setError(response.error || 'Failed to fetch followers');
        setHasMore(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [uniqueId, pageSize, minCursor, loading, hasMore]);

  const reset = useCallback(() => {
    setFollowers([]);
    setMinCursor(0);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    loadMore();
  }, [uniqueId]);

  return {
    followers,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}