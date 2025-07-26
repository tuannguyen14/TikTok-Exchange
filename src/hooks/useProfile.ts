// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { Profile, UpdateProfileRequest, ConnectTikTokRequest } from '@/types/profile';
import { profileApi } from '@/lib/api/profile';
import { useTikTokApi } from '@/hooks/useTikTok';
import { useAuth } from '@/contexts/auth-context';

export interface UseProfileReturn {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
    connectTikTok: (request: ConnectTikTokRequest) => Promise<void>;
    disconnectTikTok: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearAvatarCache: () => void;
    tiktokAvatar: string | null;
    fetchingAvatar: boolean;
}

// Constants
const TIKTOK_AVATAR_STORAGE_KEY = 'tiktok_avatars';
const AVATAR_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50;
const CACHE_CLEANUP_SIZE = 40;

// Types
interface CachedAvatar {
    url: string;
    timestamp: number;
    username: string;
}

interface AvatarCache {
    [username: string]: CachedAvatar;
}

// In-memory avatar cache for Claude.ai compatibility
let inMemoryAvatarCache: AvatarCache = {};

// Avatar storage utilities with fallback to in-memory storage
const avatarStorageUtils = {
    getAvatarFromStorage: (username: string): string | null => {
        try {
            // Try localStorage first, fallback to in-memory
            let cache: AvatarCache = {};

            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY);
                if (stored) {
                    cache = JSON.parse(stored);
                }
            } else {
                cache = inMemoryAvatarCache;
            }

            const cachedAvatar = cache[username];
            if (!cachedAvatar) return null;

            // Check expiration
            const now = Date.now();
            if (now - cachedAvatar.timestamp > AVATAR_CACHE_DURATION) {
                delete cache[username];

                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache));
                } else {
                    inMemoryAvatarCache = cache;
                }
                return null;
            }

            return cachedAvatar.url;
        } catch (error) {
            console.error('Error reading avatar from storage:', error);
            return null;
        }
    },

    saveAvatarToStorage: (username: string, avatarUrl: string): void => {
        try {
            let cache: AvatarCache = {};

            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY);
                if (stored) {
                    cache = JSON.parse(stored);
                }
            } else {
                cache = { ...inMemoryAvatarCache };
            }

            cache[username] = {
                url: avatarUrl,
                timestamp: Date.now(),
                username
            };

            // Limit cache size
            const cacheEntries = Object.entries(cache);
            if (cacheEntries.length > MAX_CACHE_SIZE) {
                const sortedEntries = cacheEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                const limitedCache: AvatarCache = {};

                sortedEntries.slice(0, CACHE_CLEANUP_SIZE).forEach(([key, value]) => {
                    limitedCache[key] = value;
                });

                cache = limitedCache;
            }

            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache));
            } else {
                inMemoryAvatarCache = cache;
            }
        } catch (error) {
            console.error('Error saving avatar to storage:', error);
        }
    },

    clearAvatarFromStorage: (username: string): void => {
        try {
            let cache: AvatarCache = {};

            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY);
                if (stored) {
                    cache = JSON.parse(stored);
                }
            } else {
                cache = { ...inMemoryAvatarCache };
            }

            delete cache[username];

            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache));
            } else {
                inMemoryAvatarCache = cache;
            }
        } catch (error) {
            console.error('Error clearing avatar from storage:', error);
        }
    },

    cleanupExpiredAvatars: (): number => {
        try {
            let cache: AvatarCache = {};

            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY);
                if (stored) {
                    cache = JSON.parse(stored);
                }
            } else {
                cache = { ...inMemoryAvatarCache };
            }

            const now = Date.now();
            let cleanedCount = 0;

            Object.keys(cache).forEach(username => {
                if (now - cache[username].timestamp > AVATAR_CACHE_DURATION) {
                    delete cache[username];
                    cleanedCount++;
                }
            });

            if (cleanedCount > 0) {
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache));
                } else {
                    inMemoryAvatarCache = cache;
                }
            }

            return cleanedCount;
        } catch (error) {
            console.error('Error cleaning up expired avatars:', error);
            return 0;
        }
    },

    clearAllAvatars: (): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(TIKTOK_AVATAR_STORAGE_KEY);
            }
            inMemoryAvatarCache = {};
        } catch (error) {
            console.error('Error clearing all avatars from storage:', error);
        }
    }
};

export const useProfile = (): UseProfileReturn => {
    // Get auth profile and session refresh function
    const { profile: authProfile, checkSession } = useAuth();

    // Local profile state for extended functionality
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tiktokAvatar, setTiktokAvatar] = useState<string | null>(null);
    const [fetchingAvatar, setFetchingAvatar] = useState(false);

    const { getProfile: getTikTokProfile } = useTikTokApi();

    const fetchTikTokAvatar = useCallback(async (username: string) => {
        if (!username) {
            setTiktokAvatar(null);
            return;
        }

        // Check cache first
        const cachedAvatar = avatarStorageUtils.getAvatarFromStorage(username);
        if (cachedAvatar) {
            console.log("Avatar found in cache");
            setTiktokAvatar(cachedAvatar);
            return;
        }

        try {
            setFetchingAvatar(true);
            const response = await getTikTokProfile(username);

            if (response.success && response.data) {
                const avatarUrl = response.data.user.avatarMedium || response.data.user.avatarLarger;
                if (avatarUrl) {
                    setTiktokAvatar(avatarUrl);
                    // Save to cache
                    avatarStorageUtils.saveAvatarToStorage(username, avatarUrl);
                } else {
                    setTiktokAvatar(null);
                }
            } else {
                setTiktokAvatar(null);
            }
        } catch (err) {
            console.error('Failed to fetch TikTok avatar:', err);
            setTiktokAvatar(null);
        } finally {
            setFetchingAvatar(false);
        }
    }, [getTikTokProfile]);

    const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
        try {
            setError(null);
            setLoading(true);

            // Use the profile API to update
            const updatedProfile = await profileApi.updateProfile(updates);

            // Refresh auth session to sync the profile
            await checkSession();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [checkSession]);

    const connectTikTok = useCallback(async (request: ConnectTikTokRequest) => {
        try {
            setError(null);
            setLoading(true);

            const updatedProfile = await profileApi.connectTikTok(request);

            // Refresh auth session to sync the profile
            await checkSession();

            // Fetch avatar after successful connection
            if (updatedProfile.tiktok_username) {
                await fetchTikTokAvatar(updatedProfile.tiktok_username);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect TikTok';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [checkSession, fetchTikTokAvatar]);

    const disconnectTikTok = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            await profileApi.disconnectTikTok();

            // Clear avatar state and cache
            setTiktokAvatar(null);
            if (authProfile?.tiktok_username) {
                avatarStorageUtils.clearAvatarFromStorage(authProfile.tiktok_username);
            }

            // Refresh auth session to sync the profile
            await checkSession();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect TikTok';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [authProfile?.tiktok_username, checkSession]);

    const refreshProfile = useCallback(async () => {
        try {
            setError(null);
            await checkSession();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile';
            setError(errorMessage);
        }
    }, [checkSession]);

    const clearAvatarCache = useCallback(() => {
        // Clear current avatar state
        setTiktokAvatar(null);
        // Clear all cached avatars
        avatarStorageUtils.clearAllAvatars();
        console.log('TikTok avatar cache cleared');
    }, []);

    // Cleanup expired avatars on mount
    useEffect(() => {
        const cleanedCount = avatarStorageUtils.cleanupExpiredAvatars();
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired TikTok avatars`);
        }
    }, []);

    // Fetch TikTok avatar when profile changes
    useEffect(() => {
        if (authProfile?.tiktok_username) {
            fetchTikTokAvatar(authProfile.tiktok_username);
        } else {
            setTiktokAvatar(null);
        }
    }, [authProfile?.tiktok_username, fetchTikTokAvatar]);

    return {
        profile: authProfile, // Use profile from auth context
        loading,
        error,
        updateProfile,
        connectTikTok,
        disconnectTikTok,
        refreshProfile,
        clearAvatarCache,
        tiktokAvatar,
        fetchingAvatar,
    };
};