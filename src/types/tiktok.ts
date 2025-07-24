// types/tiktok.ts

export interface DeviceInfo {
    deviceId: string;
    screenWidth: number;
    screenHeight: number;
    countryCode: string;
    timezone: string;
  }
  
  export interface TikTokOptions {
    useCurrentUA?: boolean;
  }
  
  export interface TikTokSession {
    userAgent: string;
    deviceInfo: DeviceInfo;
    sessionId: string;
  }
  
  export interface UserStats {
    followerCount: number;
    followingCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
  }
  
  export interface User {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
    avatarMedium: string;
    avatarLarger: string;
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
  
  export interface UserInfo {
    user: User;
    stats: UserStats;
  }
  
  export interface VideoStats {
    playCount: number;
    diggCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  }
  
  export interface VideoInfo extends VideoStats {
    tiktokID: string;
    videoID: string;
    url: string;
  }
  
  export interface FollowerUser {
    user: {
      id: string;
      uniqueId: string;
      nickname: string;
      avatarThumb: string;
      avatarMedium: string;
      avatarLarger: string;
      signature: string;
      verified: boolean;
      secUid: string;
      ftc: boolean;
    };
    stats: UserStats;
  }
  
  export interface FollowersResponse {
    userList: FollowerUser[];
    total: number;
    hasMore: boolean;
    maxCursor: number;
    minCursor: number;
  }
  
  export interface RequestQueueItem {
    requestFn: (...args: any[]) => Promise<any>;
    args: any[];
    resolve: (value: any) => void;
  }
  
  // API Response Types
  export type ProfileResult = [boolean, UserInfo | null];
  export type FollowersResult = [boolean, FollowerUser[], number, FollowersResponse | null];
  export type VideoResult = [boolean, VideoInfo | null];
  
  // Error Types
  export interface TikTokError {
    message: string;
    code?: string;
    status?: number;
  }
  
  // API Response Wrapper
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: TikTokError;
    message?: string;
  }
  
  // NextJS API Handler Types
  export interface ProfileApiRequest {
    username: string;
    useCurrentUA?: string;
  }
  
  export interface VideoApiRequest {
    videoUrl: string;
    useCurrentUA?: boolean;
  }
  
  export interface FollowersApiRequest {
    username: string;
    useCurrentUA?: boolean;
    maxCursor?: number;
    count?: number;
  }