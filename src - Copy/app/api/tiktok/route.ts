import axios from 'axios';

// RapidAPI Configuration
const RAPIDAPI_KEY = '80cc20eb9amsh706b7e8bed903c8p14195cjsn3ead5a6170d1';
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';
const BASE_URL = 'https://tiktok-api23.p.rapidapi.com/api';

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

// New interfaces for post detail (replacing liked posts)
interface TikTokPostStats {
    collectCount: string;
    commentCount: number;
    diggCount: number;
    playCount: number;
    shareCount: number;
}

interface TikTokPostStatsV2 {
    collectCount: string;
    commentCount: string;
    diggCount: string;
    playCount: string;
    repostCount: string;
    shareCount: string;
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
    canExpPlaylist: boolean;
    commentSetting: number;
    createTime: number;
    downloadSetting: number;
    duetSetting: number;
    ftc: boolean;
    isADVirtual: boolean;
    isEmbedBanned: boolean;
    nickNameModifyTime: number;
    nowInvitationCardUrl: string;
    openFavorite: boolean;
    privateAccount: boolean;
    recommendReason: string;
    relation: number;
    roomId: string;
    secret: boolean;
    shortId: string;
    stitchSetting: number;
    suggestAccountBind: boolean;
    ttSeller: boolean;
    uniqueIdModifyTime: number;
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
    preciseDuration: {
        preciseAuditionDuration: number;
        preciseDuration: number;
        preciseShootDuration: number;
        preciseVideoDuration: number;
    };
    scheduleSearchTime: number;
    title: string;
}

interface TikTokPostVideo {
    bitrate: number;
    bitrateInfo: Array<{
        Bitrate: number;
        CodecType: string;
        GearName: string;
        PlayAddr: {
            DataSize: string;
            FileCs: string;
            FileHash: string;
            Uri: string;
            UrlKey: string;
            UrlList: string[];
        };
        QualityType: number;
    }>;
    codecType: string;
    cover: string;
    definition: string;
    downloadAddr: string;
    duration: number;
    dynamicCover: string;
    encodeUserTag: string;
    encodedType: string;
    format: string;
    height: number;
    id: string;
    originCover: string;
    playAddr: string;
    ratio: string;
    reflowCover: string;
    shareCover: string[];
    subtitleInfos: any[];
    videoQuality: string;
    volumeInfo: {
        Loudness: number;
        Peak: number;
    };
    width: number;
    zoomCover: {
        '240': string;
        '480': string;
        '720': string;
        '960': string;
    };
}

interface TikTokPostDetail {
    AIGCDescription: string;
    IsAigc: boolean;
    author: TikTokPostAuthor;
    challenges: any[];
    channelTags: any[];
    collected: boolean;
    comments: any[];
    contents: Array<{
        desc: string;
        textExtra: any[];
    }>;
    createTime: string;
    desc: string;
    digged: boolean;
    diversificationId: number;
    diversificationLabels: string[];
    duetDisplay: number;
    duetEnabled: boolean;
    effectStickers: any[];
    forFriend: boolean;
    id: string;
    indexEnabled: boolean;
    itemCommentStatus: number;
    item_control: {
        can_repost: boolean;
    };
    keywordTags: Array<{
        keyword: string;
        pageType: number;
    }>;
    locationCreated: string;
    music: TikTokPostMusic;
    officalItem: boolean;
    originalItem: boolean;
    privateItem: boolean;
    scheduleTime: number;
    secret: boolean;
    shareEnabled: boolean;
    stats: TikTokPostStats;
    statsV2: TikTokPostStatsV2;
    stickersOnItem: any[];
    stitchDisplay: number;
    stitchEnabled: boolean;
    suggestedWords: string[];
    takeDown: number;
    textExtra: any[];
    video: TikTokPostVideo;
    warnInfo: any[];
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

// Common RapidAPI headers
function getRapidAPIHeaders() {
    return {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
}

// Get user profile using RapidAPI
async function onGetProfile(uniqueId: string): Promise<[boolean, TikTokUserInfo | null, string | null]> {
    try {
        const url = `${BASE_URL}/user/info`;
        console.log("Fetch User Profile from RapidAPI: " + url);

        const response = await axios.get(url, {
            headers: getRapidAPIHeaders(),
            params: {
                uniqueId: uniqueId
            }
        });

        const data = response.data;
        
        // Check if request was successful
        if (data.statusCode !== 0 || data.status_code !== 0) {
            console.error('RapidAPI Error:', data.status_msg || 'Unknown error');
            return [false, null, data.status_msg || 'API Error'];
        }

        // Check if userInfo exists
        if (!data.userInfo) {
            return [false, null, 'User not found'];
        }

        const userInfo: TikTokUserInfo = {
            user: data.userInfo.user,
            stats: data.userInfo.stats
        };

        return [true, userInfo, null];
    } catch (error) {
        console.error('Error in onGetProfile:', error);
        if (axios.isAxiosError(error)) {
            return [false, null, `API Error: ${error.response?.status} - ${error.response?.statusText}`];
        }
        return [false, null, error instanceof Error ? error.message : 'Unknown error'];
    }
}

async function getTikTokProfile(uniqueId: string): Promise<[boolean, TikTokUserInfo | null, string | null]> {
    try {
        return await onGetProfile(uniqueId);
    } catch (error) {
        console.error('Error in getTikTokProfile:', error);
        return [false, null, error instanceof Error ? error.message : 'Unknown error'];
    }
}

// Get user followers using RapidAPI
async function getFollowsList(secUid: string, count: number = 30, minCursor: number = 0): Promise<[boolean, Array<any>, number, FollowsListResponse | null, string | null]> {
    try {
        const url = `${BASE_URL}/user/followers`;
        console.log("Fetch User Followers from RapidAPI: " + url);

        const response = await axios.get(url, {
            headers: getRapidAPIHeaders(),
            params: {
                secUid: secUid,
                count: count,
                minCursor: minCursor
            }
        });

        const data: FollowsListResponse = response.data;

        // Check if request was successful
        if (data.statusCode !== 0 || data.status_code !== 0) {
            console.error('RapidAPI Error:', 'Failed to fetch followers');
            return [false, [], 0, null, 'Failed to fetch followers'];
        }

        const followersList = data.userList || [];
        const total = data.total || 0;

        return [true, followersList, total, data, null];
    } catch (error) {
        console.error('Error in getFollowsList:', error);
        if (axios.isAxiosError(error)) {
            return [false, [], 0, null, `API Error: ${error.response?.status} - ${error.response?.statusText}`];
        }
        return [false, [], 0, null, error instanceof Error ? error.message : 'Unknown error'];
    }
}

// Get post detail using RapidAPI (replacing getVideoInfoFunction)
async function getPostDetail(videoId: string): Promise<[boolean, PostDetailResponse | null, string | null]> {
    try {
        const url = `${BASE_URL}/post/detail`;
        console.log("Fetch Post Detail from RapidAPI: " + url);

        const response = await axios.get(url, {
            headers: getRapidAPIHeaders(),
            params: {
                videoId: videoId
            }
        });

        const data: PostDetailResponse = response.data;

        // Check if request was successful
        if (data.statusCode !== 0) {
            console.error('RapidAPI Error:', data.statusMsg || 'Failed to fetch post detail');
            return [false, null, data.statusMsg || 'Failed to fetch post detail'];
        }

        return [true, data, null];
    } catch (error) {
        console.error('Error in getPostDetail:', error);
        if (axios.isAxiosError(error)) {
            return [false, null, `API Error: ${error.response?.status} - ${error.response?.statusText}`];
        }
        return [false, null, error instanceof Error ? error.message : 'Unknown error'];
    }
}

// Helper function to get user profile and extract secUid
async function getUserSecUid(uniqueId: string): Promise<[boolean, string | null, string | null]> {
    const [success, userInfo, error] = await getTikTokProfile(uniqueId);
    if (success && userInfo) {
        return [true, userInfo.user.secUid, null];
    }
    return [false, null, error];
}

// HTTP method handler for Next.js
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const uniqueId = searchParams.get('uniqueId');
    const secUid = searchParams.get('secUid');
    const count = parseInt(searchParams.get('count') || '30');
    const cursor = parseInt(searchParams.get('cursor') || '0');
    const minCursor = parseInt(searchParams.get('minCursor') || '0');

    try {
        switch (action) {
            case 'getProfile':
                if (!uniqueId) {
                    return Response.json({ error: 'uniqueId is required' }, { status: 400 });
                }
                const [profileExists, userInfo, profileError] = await getTikTokProfile(uniqueId);
                return Response.json({
                    success: profileExists,
                    data: userInfo,
                    error: profileError
                });

            case 'getFollowers':
                let targetSecUid = secUid;
                
                // If secUid not provided, get it from uniqueId
                if (!targetSecUid && uniqueId) {
                    const [secUidSuccess, extractedSecUid, secUidError] = await getUserSecUid(uniqueId);
                    if (!secUidSuccess || !extractedSecUid) {
                        return Response.json({ 
                            success: false, 
                            error: secUidError || 'Unable to get user secUid' 
                        }, { status: 400 });
                    }
                    targetSecUid = extractedSecUid;
                }

                if (!targetSecUid) {
                    return Response.json({ error: 'secUid or uniqueId is required' }, { status: 400 });
                }

                const [followersExists, followers, total, followersData, followersError] = await getFollowsList(targetSecUid, count, minCursor);
                return Response.json({
                    success: followersExists,
                    data: { 
                        followers, 
                        total, 
                        responseData: followersData 
                    },
                    error: followersError
                });

            case 'getPostDetail':
                const videoId = searchParams.get('videoId');
                
                if (!videoId) {
                    return Response.json({ error: 'videoId is required' }, { status: 400 });
                }

                const [postExists, postData, postError] = await getPostDetail(videoId);
                return Response.json({
                    success: postExists,
                    data: postData,
                    error: postError
                });

            default:
                return Response.json({ error: 'Invalid action. Available actions: getProfile, getFollowers, getPostDetail' }, { status: 400 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}