// lib/tiktok-api-client.ts

// Types - Updated to match RapidAPI response structure
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
    // Additional fields from RapidAPI
    bioLink?: {
        link: string;
        risk: number;
    };
    commerceUserInfo?: {
        commerceUser: boolean;
    };
    downloadSetting?: number;
    followingVisibility?: number;
    isADVirtual?: boolean;
    isEmbedBanned?: boolean;
    nickNameModifyTime?: number;
    profileEmbedPermission?: number;
    profileTab?: {
        showMusicTab: boolean;
        showPlayListTab: boolean;
    };
    secret?: boolean;
    ttSeller?: boolean;
}

interface TikTokUserInfo {
    user: TikTokUser;
    stats: TikTokUserStats;
}

interface TikTokVideoStats {
    collectCount: string;
    commentCount: number;
    diggCount: number;
    playCount: number;
    shareCount: number;
}

interface TikTokPostAuthor {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarLarger: string;
    avatarMedium: string;
    avatarThumb: string;
    signature: string;
    verified: boolean;
    secUid: string;
}

interface TikTokPostMusic {
    authorName: string;
    collected: boolean;
    coverLarge: string;
    coverMedium: string;
    coverThumb: string;
    duration: number;
    id: string;
    original: boolean;
    playUrl: string;
    title: string;
}

interface TikTokPostVideo {
    bitrate: number;
    codecType: string;
    cover: string;
    definition: string;
    downloadAddr: string;
    duration: number;
    dynamicCover: string;
    format: string;
    height: number;
    id: string;
    originCover: string;
    playAddr: string;
    ratio: string;
    videoQuality: string;
    width: number;
    zoomCover: {
        '240': string;
        '480': string;
        '720': string;
        '960': string;
    };
}

interface TikTokPostDetail {
    id: string;
    desc: string;
    createTime: string;
    author: TikTokPostAuthor;
    music: TikTokPostMusic;
    video: TikTokPostVideo;
    stats: TikTokVideoStats;
    collected: boolean;
    digged: boolean;
    duetEnabled: boolean;
    stitchEnabled: boolean;
    shareEnabled: boolean;
    forFriend: boolean;
    officalItem: boolean;
    originalItem: boolean;
    privateItem: boolean;
    secret: boolean;
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
    statusCode: number;
    status_code: number;
}

interface PostDetailResponse {
    itemInfo: {
        itemStruct: TikTokPostDetail;
    };
    shareMeta: {
        desc: string;
        title: string;
    };
    statusCode: number;
    statusMsg: string;
}

// API Response interfaces
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

type ProfileResponse = ApiResponse<TikTokUserInfo>;

type FollowersResponse = ApiResponse<{
    followers: Array<{
        user: TikTokUser;
        stats: TikTokUserStats;
    }>;
    total: number;
    responseData: FollowsListResponse | null;
}>;

type PostDetailResponse_API = ApiResponse<PostDetailResponse>;

// API Client Class
export class TikTokApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/tiktok1') {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetch user profile information
     */
    async getProfile(uniqueId: string): Promise<ProfileResponse> {
        try {
            const params = new URLSearchParams({
                action: 'getProfile',
                uniqueId: uniqueId
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
     * @param uniqueId - User's unique ID (username)
     * @param secUid - User's security ID (optional, will be fetched if not provided)
     * @param count - Number of followers to fetch (default: 30)
     * @param minCursor - Pagination cursor (default: 0)
     */
    async getFollowers(
        uniqueId?: string,
        secUid?: string,
        count: number = 30,
        minCursor: number = 0
    ): Promise<FollowersResponse> {
        try {
            if (!uniqueId && !secUid) {
                return {
                    success: false,
                    error: 'Either uniqueId or secUid is required'
                };
            }

            const params = new URLSearchParams({
                action: 'getFollowers',
                count: count.toString(),
                minCursor: minCursor.toString()
            });

            if (uniqueId) params.append('uniqueId', uniqueId);
            if (secUid) params.append('secUid', secUid);

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
     * Fetch post detail by video ID
     * @param videoId - TikTok video ID
     */
    async getPostDetail(videoId: string): Promise<PostDetailResponse_API> {
        try {
            const params = new URLSearchParams({
                action: 'getPostDetail',
                videoId: videoId
            });

            console.log("params: ", params.toString());

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
            console.error('Error fetching post detail:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Batch operations - Get multiple profiles
     */
    async getMultipleProfiles(uniqueIds: string[]): Promise<{
        success: boolean;
        results: Array<{ uniqueId: string; data: ProfileResponse }>;
    }> {
        try {
            const promises = uniqueIds.map(async (uniqueId) => ({
                uniqueId,
                data: await this.getProfile(uniqueId)
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
    async userExists(uniqueId: string): Promise<boolean> {
        const response = await this.getProfile(uniqueId);
        return response.success;
    }

    /**
     * Get user stats only (without full profile)
     */
    async getUserStats(uniqueId: string): Promise<TikTokUserStats | null> {
        const response = await this.getProfile(uniqueId);
        return response.success && response.data ? response.data.stats : null;
    }

    /**
     * Get basic user info only (without stats)
     */
    async getUserInfo(uniqueId: string): Promise<TikTokUser | null> {
        const response = await this.getProfile(uniqueId);
        return response.success && response.data ? response.data.user : null;
    }

    /**
     * Get user's secUid
     */
    async getUserSecUid(uniqueId: string): Promise<string | null> {
        const response = await this.getProfile(uniqueId);
        return response.success && response.data ? response.data.user.secUid : null;
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
    async getFormattedStats(uniqueId: string): Promise<{
        followers: string;
        following: string;
        hearts: string;
        videos: string;
    } | null> {
        const stats = await this.getUserStats(uniqueId);
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

    /**
     * Get video thumbnail from post detail
     */
    getVideoThumbnail(post: TikTokPostDetail, size: '240' | '480' | '720' | '960' = '720'): string {
        return post.video.zoomCover[size] || post.video.cover;
    }

    /**
     * Get video play URL from post detail
     */
    getVideoPlayUrl(post: TikTokPostDetail): string {
        return post.video.playAddr;
    }

    /**
     * Get video download URL from post detail
     */
    getVideoDownloadUrl(post: TikTokPostDetail): string {
        return post.video.downloadAddr;
    }

    /**
     * Format timestamp to readable date
     */
    formatCreateTime(timestamp: string): string {
        return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
    }

    /**
     * Get video duration in readable format
     */
    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Create a singleton instance
export const tiktokApi = new TikTokApiClient();

// Export types for use in other files
export type {
    TikTokUser,
    TikTokUserInfo,
    TikTokUserStats,
    TikTokPostDetail,
    TikTokVideoStats,
    TikTokPostAuthor,
    TikTokPostMusic,
    TikTokPostVideo,
    FollowsListResponse,
    PostDetailResponse,
    ProfileResponse,
    FollowersResponse,
    PostDetailResponse_API
};