// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { Profile, UpdateProfileRequest, ConnectTikTokRequest } from '@/types/profile';
import { profileApi } from '@/lib/api/profile';
import { useTikTokApi } from '@/hooks/useTikTok';

export interface UseProfileReturn {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
    connectTikTok: (request: ConnectTikTokRequest) => Promise<void>;
    disconnectTikTok: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    tiktokAvatar: string | null;
    fetchingAvatar: boolean;
}

export const useProfile = (): UseProfileReturn => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tiktokAvatar, setTiktokAvatar] = useState<string | null>(null);
    const [fetchingAvatar, setFetchingAvatar] = useState(false);

    const { getProfile: getTikTokProfile } = useTikTokApi();

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await profileApi.getProfile();
            setProfile(profileData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTikTokAvatar = useCallback(async (username: string) => {
        if (!username) {
            setTiktokAvatar(null);
            return;
        }

        try {
            setFetchingAvatar(true);
            const response = await getTikTokProfile(username);

            if (response.success && response.data) {
                // Extract avatar from TikTok API response  
                const avatarUrl = response.data.user.avatarMedium || response.data.user.avatarLarger;
                setTiktokAvatar(avatarUrl || null);
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
            const updatedProfile = await profileApi.updateProfile(updates);
            setProfile(updatedProfile);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const connectTikTok = useCallback(async (request: ConnectTikTokRequest) => {
        try {
            setError(null);
            const updatedProfile = await profileApi.connectTikTok(request);
            setProfile(updatedProfile);
            // Fetch avatar after successful connection
            if (updatedProfile.tiktok_username) {
                await fetchTikTokAvatar(updatedProfile.tiktok_username);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect TikTok';
            setError(errorMessage);
            throw err;
        }
    }, [fetchTikTokAvatar]);

    const disconnectTikTok = useCallback(async () => {
        try {
            setError(null);
            const updatedProfile = await profileApi.disconnectTikTok();
            setProfile(updatedProfile);
            setTiktokAvatar(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect TikTok';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Fetch TikTok avatar when profile changes
    useEffect(() => {
        if (profile?.tiktok_username) {
            fetchTikTokAvatar(profile.tiktok_username);
        } else {
            setTiktokAvatar(null);
        }
    }, [profile?.tiktok_username, fetchTikTokAvatar]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        connectTikTok,
        disconnectTikTok,
        refreshProfile,
        tiktokAvatar,
        fetchingAvatar,
    };
};