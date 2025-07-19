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

// Enhanced utility functions
function generateString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function getRealisticUserAgent(userAgent?: string): string {
    // Sử dụng user agent từ request nếu có, otherwise fallback
    if (userAgent && userAgent.includes('Mozilla')) {
        return userAgent;
    }

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRealisticDeviceInfo(userAgent: string) {
    // Extract OS from user agent for more realistic device info
    const isWindows = userAgent.includes('Windows');
    const isMac = userAgent.includes('Mac OS X');
    const isLinux = userAgent.includes('Linux');

    const resolutions = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 },
        { width: 1440, height: 900 },
        { width: 2560, height: 1440 },
        { width: 1920, height: 1200 }
    ];

    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];

    return {
        deviceId: generateString(19),
        screenWidth: resolution.width,
        screenHeight: resolution.height,
        region: 'US',
        timezone: 'America/New_York',
        language: 'en-US',
        platform: isWindows ? 'Win32' : isMac ? 'MacIntel' : 'Linux x86_64'
    };
}

function generateRealisticHeaders(userAgent: string, referer?: string): Record<string, string> {
    const baseHeaders: Record<string, string> = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    };

    if (referer) {
        baseHeaders['Referer'] = referer;
        baseHeaders['Sec-Fetch-Site'] = 'same-origin';
    }

    return baseHeaders;
}

// Delay function to avoid rate limiting
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry mechanism with exponential backoff
async function retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delayTime = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                await delay(delayTime);
            }

            return await requestFn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (error.response?.status === 404 || error.response?.status === 403) {
                throw error;
            }

            console.log(`Attempt ${attempt + 1} failed:`, error.message);

            if (attempt === maxRetries) {
                break;
            }
        }
    }

    throw lastError;
}

// Enhanced profile fetching with better error handling
async function onGetProfile(id: string, clientUserAgent?: string): Promise<[boolean, string | null, string | null, TikTokUserInfo | null, string | null]> {
    try {
        const url = `https://www.tiktok.com/@${id}`;
        console.log("Fetch User Url: " + url);

        const userAgent = getRealisticUserAgent(clientUserAgent);
        const headers = generateRealisticHeaders(userAgent);

        const response = await retryRequest(async () => {
            return await axios.get(url, {
                headers,
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500 // Don't throw on 4xx errors
            });
        });

        if (response.status === 401) {
            console.log("Received 401 - possible IP block or rate limit");
            return [false, null, null, null, "Rate limited or IP blocked"];
        }

        if (response.status === 404) {
            console.log("User not found");
            return [false, null, null, null, "User not found"];
        }

        if (response.status !== 200) {
            console.log(`Unexpected status: ${response.status}`);
            return [false, null, null, null, `HTTP ${response.status}`];
        }

        const htmlText = response.data;

        if (!htmlText || typeof htmlText !== 'string') {
            return [false, null, null, null, "Invalid response format"];
        }

        const secUidIndex = htmlText.indexOf("secUid");
        if (secUidIndex === -1) {
            console.log("secUid not found in response");
            return [false, null, null, null, "secUid not found"];
        }

        // Parse the HTML content
        const $ = cheerio.load(htmlText);

        // Find the script tag containing the JSON data
        const scriptTag = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (scriptTag) {
            try {
                const jsonDataStr = scriptTag.trim();
                const jsonData = JSON.parse(jsonDataStr);

                const userInfo = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.['userInfo'];
                if (!userInfo) {
                    return [false, null, null, null, "User info not found in response"];
                }

                const secUid = userInfo?.['user']?.['secUid'];
                if (!secUid) {
                    return [false, null, null, null, "secUid not found in user info"];
                }

                const msToken = response.headers['x-ms-token'] || generateString(128);

                return [true, msToken, secUid, userInfo, null];
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return [false, null, null, null, "JSON parse error"];
            }
        }

        return [false, null, null, null, "Script tag not found"];
    } catch (error: any) {
        console.error('Error in onGetProfile:', error.message);

        if (error.code === 'ECONNABORTED') {
            return [false, null, null, null, "Request timeout"];
        }

        if (error.response?.status === 401) {
            return [false, null, null, null, "Authentication failed"];
        }

        return [false, null, null, null, error.message || "Unknown error"];
    }
}

async function getTikTokProfile(id: string, clientUserAgent?: string): Promise<[boolean, TikTokUserInfo | null, string | null]> {
    try {
        const [isExist, msToken, secUid, userInfo, error] = await onGetProfile(id, clientUserAgent);
        return [isExist, userInfo, error];
    } catch (error: any) {
        console.error('Error in getTikTokProfile:', error);
        return [false, null, error.message];
    }
}

async function getFollowsList(id: string, clientUserAgent?: string): Promise<[boolean, Array<any>, number, FollowsListResponse | null, string | null]> {
    try {
        const [isExist, msToken, secUid, userInfo, error] = await onGetProfile(id, clientUserAgent);
        let followersList: Array<any> = [];
        let total = 0;
        let responseData: FollowsListResponse | null = null;

        if (!isExist) {
            return [false, [], -1, null, error];
        }

        if (isExist && secUid && msToken) {
            const signature = "_" + generateString(46);
            const userAgent = getRealisticUserAgent(clientUserAgent);
            const deviceInfo = getRealisticDeviceInfo(userAgent);

            const params = new URLSearchParams({
                aid: '1988',
                app_language: 'en',
                app_name: 'tiktok_web',
                browser_language: deviceInfo.language,
                browser_name: 'Mozilla',
                browser_online: 'true',
                browser_platform: deviceInfo.platform,
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

            const response = await retryRequest(async () => {
                return await axios.get(url, {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': deviceInfo.language,
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Referer': `https://www.tiktok.com/@${id}`,
                        'X-Requested-With': 'XMLHttpRequest',
                        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"'
                    },
                    timeout: 15000
                });
            });

            responseData = response.data;
            if (responseData) {
                followersList = responseData.userList || [];
                total = responseData.total || 0;
            }
        }

        return [isExist, followersList, total, responseData, null];
    } catch (error: any) {
        console.error('Error in getFollowsList:', error);
        return [false, [], -1, null, error.message];
    }
}

async function getVideoInfoFunction(videoLink: string, clientUserAgent?: string): Promise<[boolean, TikTokVideoInfo | null, string | null]> {
    try {
        if (videoLink.indexOf("tiktok") === -1) {
            return [false, null, "Invalid TikTok URL"];
        }

        console.log("fetch: " + videoLink);

        const userAgent = getRealisticUserAgent(clientUserAgent);
        const headers = generateRealisticHeaders(userAgent);

        const response = await retryRequest(async () => {
            return await axios.get(videoLink, {
                headers,
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500
            });
        });

        if (response.status === 401) {
            return [false, null, "Authentication failed - possible rate limit"];
        }

        if (response.status === 404) {
            return [false, null, "Video not found"];
        }

        if (response.status !== 200) {
            return [false, null, `HTTP ${response.status}`];
        }

        const htmlText = response.data;

        if (!htmlText || typeof htmlText !== 'string') {
            return [false, null, "Invalid response format"];
        }

        const secUidIndex = htmlText.indexOf("secUid");
        if (secUidIndex === -1) {
            return [false, null, "Video data not found"];
        }

        // Parse the HTML content
        const $ = cheerio.load(htmlText);

        // Find the script tag containing the JSON data
        const scriptTag = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (scriptTag) {
            try {
                const jsonDataStr = scriptTag.trim();
                const jsonData = JSON.parse(jsonDataStr);

                const videoInfo = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['stats'];
                const videoLink = jsonData?.['__DEFAULT_SCOPE__']?.['seo.abtest']?.['canonical'];
                const videoAvatars = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['video']?.['zoomCover'];

                if (!videoInfo || !videoLink) {
                    return [false, null, "Video information not found"];
                }

                // Define a regular expression to match the pattern
                const regex = /@([^/]+)\/video\/(\d+)/;

                // Execute the regular expression on the URL
                const match = videoLink.match(regex);

                if (!match) {
                    return [false, null, "Invalid video URL format"];
                }

                const tiktokID = match[1];
                const videoID = match[2];

                const result: TikTokVideoInfo = {
                    ...videoInfo,
                    tiktokID,
                    videoID,
                    url: videoAvatars?.['720'] || videoAvatars?.['540'] || videoAvatars?.['360'] || ''
                };

                return [true, result, null];
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return [false, null, "JSON parse error"];
            }
        }

        return [false, null, "Script tag not found"];
    } catch (error: any) {
        console.error('Error in getVideoInfoFunction:', error);

        if (error.code === 'ECONNABORTED') {
            return [false, null, "Request timeout"];
        }

        if (error.response?.status === 401) {
            return [false, null, "Authentication failed"];
        }

        return [false, null, error.message || "Unknown error"];
    }
}

async function getVideoInfo(videoLink: string, clientUserAgent?: string): Promise<[boolean, TikTokVideoInfo | null, string | null]> {
    try {
        const [isExist, videoInfo, error] = await getVideoInfoFunction(videoLink, clientUserAgent);
        return [isExist, videoInfo, error];
    } catch (error: any) {
        console.error('Error in getVideoInfo:', error);
        return [false, null, error.message];
    }
}

// Enhanced HTTP method handler
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const videoLink = searchParams.get('videoLink');

    // Lấy user agent từ request header
    const clientUserAgent = request.headers.get('user-agent') || undefined;

    // Add a small random delay to seem more human-like
    await delay(Math.random() * 500 + 200);

    try {
        switch (action) {
            case 'getProfile':
                if (!id) {
                    return Response.json({ error: 'ID is required' }, { status: 400 });
                }
                const [profileExists, userInfo, profileError] = await getTikTokProfile(id, clientUserAgent);

                if (!profileExists) {
                    return Response.json({
                        success: false,
                        error: profileError || 'Profile not found'
                    });
                }

                return Response.json({
                    success: profileExists,
                    data: userInfo
                });

            case 'getFollowers':
                if (!id) {
                    return Response.json({ error: 'ID is required' }, { status: 400 });
                }
                const [followersExists, followers, total, responseData, followersError] = await getFollowsList(id, clientUserAgent);

                if (!followersExists) {
                    return Response.json({
                        success: false,
                        error: followersError || 'Followers not found'
                    });
                }

                return Response.json({
                    success: followersExists,
                    data: { followers, total, responseData }
                });

            case 'getVideoInfo':
                if (!videoLink) {
                    return Response.json({ error: 'Video link is required' }, { status: 400 });
                }
                const [videoExists, videoInfo, videoError] = await getVideoInfo(videoLink, clientUserAgent);

                if (!videoExists) {
                    return Response.json({
                        success: false,
                        error: videoError || 'Video not found'
                    });
                }

                return Response.json({
                    success: videoExists,
                    data: videoInfo
                });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({
            success: false,
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}