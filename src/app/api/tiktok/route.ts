import axios from 'axios';
import * as cheerio from 'cheerio';

// Types
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

// Utility functions
function generateString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function generateUserAgent(): string {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getDeviceInfo() {
    return {
        deviceId: generateString(19),
        screenWidth: typeof window !== 'undefined' ? window.screen.width : 1920,
        screenHeight: typeof window !== 'undefined' ? window.screen.height : 1080,
        region: 'US',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: typeof navigator !== 'undefined' ? navigator.language : 'en-US'
    };
}

// Core API functions
async function onGetProfile(id: string): Promise<[boolean, string | null, string | null, TikTokUserInfo | null, string | null]> {
    try {
        const url = `https://www.tiktok.com/@${id}`;
        console.log("Fetch User Url: " + url);

        const userAgent = generateUserAgent();

        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            }
        });

        const htmlText = response.data;
        const secUidIndex = htmlText.indexOf("secUid");

        if (secUidIndex === -1) {
            return [false, null, null, null, null];
        }

        // Parse the HTML content
        const $ = cheerio.load(htmlText);

        // Find the script tag containing the JSON data
        const scriptTag = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (scriptTag) {
            const jsonDataStr = scriptTag.trim();
            const jsonData = JSON.parse(jsonDataStr);

            const userInfo = jsonData['__DEFAULT_SCOPE__']['webapp.user-detail']['userInfo'];
            const secUid = userInfo['user']['secUid'];
            const msToken = response.headers['x-ms-token'] || generateString(128);

            return [true, msToken, secUid, userInfo, null];
        }

        return [false, null, null, null, null];
    } catch (error) {
        console.error('Error in onGetProfile:', error);
        return [false, null, null, null, null];
    }
}

export async function onGetTikTokProfile(id: string): Promise<[boolean, TikTokUserInfo | null]> {
    try {
        const [isExist, msToken, secUid, userInfo] = await onGetProfile(id);
        console.log("secUid: " + secUid);
        return [isExist, userInfo];
    } catch (error) {
        console.error('Error in onGetTikTokProfile:', error);
        return [false, null];
    }
}

export async function onGetFollowsList(id: string): Promise<[boolean, Array<any>, number, FollowsListResponse | null]> {
    try {
        const [isExist, msToken, secUid, userInfo] = await onGetProfile(id);
        let followersList: Array<any> = [];
        let total = 0;
        let responseData: FollowsListResponse | null = null;

        if (isExist && secUid && msToken) {
            const signature = "_" + generateString(46);
            const deviceInfo = getDeviceInfo();
            const userAgent = generateUserAgent();

            const params = new URLSearchParams({
                aid: '1988',
                app_language: 'en',
                app_name: 'tiktok_web',
                browser_language: deviceInfo.language,
                browser_name: 'Mozilla',
                browser_online: 'true',
                browser_platform: 'Win32',
                browser_version: encodeURIComponent(userAgent),
                channel: 'tiktok_web',
                cookie_enabled: 'true',
                count: '30',
                device_id: deviceInfo.deviceId,
                device_platform: 'web_pc',
                focus_state: 'true',
                from_page: 'user',
                history_len: '8',
                is_fullscreen: 'false',
                is_page_visible: 'true',
                maxCursor: '0',
                minCursor: '0',
                os: 'windows',
                priority_region: '',
                referer: '',
                region: deviceInfo.region,
                scene: '21',
                screen_height: deviceInfo.screenHeight.toString(),
                screen_width: deviceInfo.screenWidth.toString(),
                secUid: secUid,
                tz_name: encodeURIComponent(deviceInfo.timezone),
                webcast_language: 'en',
                msToken: msToken,
                _signature: signature
            });

            const url = `https://www.tiktok.com/api/user/list/?${params.toString()}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': userAgent,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': deviceInfo.language,
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': `https://www.tiktok.com/@${id}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('Followers API URL:', url);
            console.log('Response:', response.data);

            responseData = response.data;
            if (responseData) {
                followersList = responseData.userList || [];
                total = responseData.total || 0;
            }
        }

        return [isExist, followersList, total, responseData];
    } catch (error) {
        console.error('Error in onGetFollowsList:', error);
        return [false, [], -1, null];
    }
}

async function onGetVideoInfoFunction(videoLink: string): Promise<[boolean, TikTokVideoInfo | null]> {
    try {
        if (videoLink.indexOf("tiktok") === -1) {
            return [false, null];
        }

        console.log("fetch: " + videoLink);

        const userAgent = generateUserAgent();

        const response = await axios.get(videoLink, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            }
        });

        const htmlText = response.data;
        const secUidIndex = htmlText.indexOf("secUid");

        console.log("secUidIndex: " + secUidIndex);

        if (secUidIndex === -1) {
            return [false, null];
        }

        // Parse the HTML content
        const $ = cheerio.load(htmlText);

        // Find the script tag containing the JSON data
        const scriptTag = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (scriptTag) {
            const jsonDataStr = scriptTag.trim();
            const jsonData = JSON.parse(jsonDataStr);

            const videoInfo = jsonData['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct']['stats'];
            const videoLink = jsonData['__DEFAULT_SCOPE__']['seo.abtest']['canonical'];
            const videoAvatars = jsonData['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct']['video']['zoomCover'];

            console.log(jsonData['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct']['video']);

            // Define a regular expression to match the pattern
            const regex = /@([^/]+)\/video\/(\d+)/;

            // Execute the regular expression on the URL
            const match = videoLink.match(regex);

            if (!match) {
                return [false, null];
            }

            const tiktokID = match[1];
            const videoID = match[2];

            const result: TikTokVideoInfo = {
                ...videoInfo,
                tiktokID,
                videoID,
                url: videoAvatars['720'] || videoAvatars['540'] || videoAvatars['360'] || ''
            };

            return [true, result];
        }

        return [false, null];
    } catch (error) {
        console.error('Error in onGetVideoInfoFunction:', error);
        return [false, null];
    }
}

export async function onGetVideoInfo(videoLink: string): Promise<[boolean, TikTokVideoInfo | null]> {
    try {
        const [isExist, videoInfo] = await onGetVideoInfoFunction(videoLink);
        return [isExist, videoInfo];
    } catch (error) {
        console.error('Error in onGetVideoInfo:', error);
        return [false, null];
    }
}

// API Routes for Next.js
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const videoLink = searchParams.get('videoLink');

    try {
        switch (action) {
            case 'getProfile':
                if (!id) {
                    return Response.json({ error: 'ID is required' }, { status: 400 });
                }
                const [profileExists, userInfo] = await onGetTikTokProfile(id);
                return Response.json({
                    success: profileExists,
                    data: userInfo
                });

            case 'getFollowers':
                if (!id) {
                    return Response.json({ error: 'ID is required' }, { status: 400 });
                }
                const [followersExists, followers, total, responseData] = await onGetFollowsList(id);
                return Response.json({
                    success: followersExists,
                    data: { followers, total, responseData }
                });

            case 'getVideoInfo':
                if (!videoLink) {
                    return Response.json({ error: 'Video link is required' }, { status: 400 });
                }
                const [videoExists, videoInfo] = await onGetVideoInfo(videoLink);
                return Response.json({
                    success: videoExists,
                    data: videoInfo
                });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}