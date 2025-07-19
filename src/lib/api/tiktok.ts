// lib/tiktok-api-client.ts

// Types (copy from your route.ts)
interface TikTokUserStats {
    followerCount: number;
    followingCount: number;
    heart: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
    friendCount: number;
}

interface TikTokUser {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarLarger: string;
    avatarMedium: string;
    avatarThumb: string;
    signature: string;
    verified: boolean;
    secUid: string;
    ftc: boolean;
    relation: number;
    openFavorite: boolean;
    commentSetting: number;
    duetSetting: number;
    stitchSetting: number;
    privateAccount: boolean;
}

interface TikTokUserInfo {
    user: TikTokUser;
    stats: TikTokUserStats;
}

interface TikTokVideoStats {
    diggCount: number;
    shareCount: number;
    commentCount: number;
    playCount: number;
    collectCount: number;
}

interface TikTokVideoInfo extends TikTokVideoStats {
    tiktokID: string;
    videoID: string;
    url: string;
}

interface FollowsListResponse {
    userList: Array<{
        user: TikTokUser;
        stats: TikTokUserStats;
    }>;
    total: number;
    hasMore: boolean;
    maxCursor: number;
    minCursor: number;
}

// API Response interfaces
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// interface ProfileResponse extends ApiResponse<TikTokUserInfo> { }
type ProfileResponse = ApiResponse<TikTokUserInfo>;

// interface FollowersResponse extends ApiResponse<{
//     followers: Array<any>;
//     total: number;
//     responseData: FollowsListResponse | null;
// }> { }
type FollowersResponse = ApiResponse<{
    followers: Array<any>;
    total: number;
    responseData: FollowsListResponse | null;
}>;

// interface VideoInfoResponse extends ApiResponse<TikTokVideoInfo> { }
type VideoInfoResponse = ApiResponse<TikTokVideoInfo>;

// API Client Class
export class TikTokApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/tiktok') {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetch user profile information
     */
    async getProfile(username: string): Promise<ProfileResponse> {
        try {
            const params = new URLSearchParams({
                action: 'getProfile',
                id: username
            });

            const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Fetch user followers list
     */
    async getFollowers(username: string): Promise<FollowersResponse> {
        try {
            const params = new URLSearchParams({
                action: 'getFollowers',
                id: username
            });

            const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching followers:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Fetch video information
     */
    async getVideoInfo(videoLink: string): Promise<VideoInfoResponse> {
        try {
            const params = new URLSearchParams({
                action: 'getVideoInfo',
                videoLink: videoLink
            });

            const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching video info:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Batch operations - Get multiple profiles
     */
    async getMultipleProfiles(usernames: string[]): Promise<{
        success: boolean;
        results: Array<{ username: string; data: ProfileResponse }>;
    }> {
        try {
            const promises = usernames.map(async (username) => ({
                username,
                data: await this.getProfile(username)
            }));

            const results = await Promise.all(promises);

            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('Error in batch profile fetch:', error);
            return {
                success: false,
                results: []
            };
        }
    }

    /**
     * Utility method to check if a user exists
     */
    async userExists(username: string): Promise<boolean> {
        const response = await this.getProfile(username);
        return response.success;
    }

    /**
     * Get user stats only (without full profile)
     */
    async getUserStats(username: string): Promise<TikTokUserStats | null> {
        const response = await this.getProfile(username);
        return response.success && response.data ? response.data.stats : null;
    }

    /**
     * Get basic user info only (without stats)
     */
    async getUserInfo(username: string): Promise<TikTokUser | null> {
        const response = await this.getProfile(username);
        return response.success && response.data ? response.data.user : null;
    }

    /**
     * Format follower count to human readable format
     */
    formatCount(count: number): string {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    }

    /**
     * Get formatted user stats
     */
    async getFormattedStats(username: string): Promise<{
        followers: string;
        following: string;
        hearts: string;
        videos: string;
    } | null> {
        const stats = await this.getUserStats(username);
        if (!stats) return null;

        return {
            followers: this.formatCount(stats.followerCount),
            following: this.formatCount(stats.followingCount),
            hearts: this.formatCount(stats.heartCount),
            videos: this.formatCount(stats.videoCount)
        };
    }

    /**
     * Extract username from TikTok URL
     */
    extractUsername(url: string): string | null {
        const match = url.match(/tiktok\.com\/@([^/?]+)/);
        return match ? match[1] : null;
    }

    /**
     * Extract video ID from TikTok video URL
     */
    extractVideoId(url: string): string | null {
        const match = url.match(/video\/(\d+)/);
        return match ? match[1] : null;
    }
}

// Create a singleton instance
export const tiktokApi = new TikTokApiClient();

// Export types for use in other files
export type {
    TikTokUser,
    TikTokUserInfo,
    TikTokUserStats,
    TikTokVideoInfo,
    TikTokVideoStats,
    FollowsListResponse,
    ProfileResponse,
    FollowersResponse,
    VideoInfoResponse
};