/**
 * Validate TikTok URL and extract video ID
 * @param {string} url - The TikTok URL to validate
 * @returns {Object} - Object containing isValid boolean and videoId string (if valid)
 */
export function validateTikTokURL(url: string) {
    try {
        // Check if URL is a string
        if (typeof url !== 'string' || !url.trim()) {
            return { isValid: false, videoId: null, error: 'URL must be a non-empty string' };
        }

        // Regular expression to match TikTok video URLs
        // Pattern: https://www.tiktok.com/@username/video/videoId
        const tiktokRegex = /^https:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.-]+)\/video\/(\d+)(?:\?.*)?$/;

        const match = url.match(tiktokRegex);

        if (match) {
            const username = match[1];
            const videoId = match[2];

            // Additional validation: video ID should be numeric and reasonable length
            if (videoId && videoId.length >= 10 && videoId.length <= 25) {
                return {
                    isValid: true,
                    videoId: videoId,
                    username: username,
                    originalUrl: url
                };
            } else {
                return { isValid: false, videoId: null, error: 'Invalid video ID format' };
            }
        }

        return { isValid: false, videoId: null, error: 'URL does not match TikTok video pattern' };

    } catch (error: any) {
        return { isValid: false, videoId: null, error: `Validation error: ${error.message}` };
    }
}

/**
 * Simple function to just extract video ID (returns null if invalid)
 * @param {string} url - The TikTok URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractTikTokVideoId(url: string) {
    const result = validateTikTokURL(url);
    return result.isValid ? result.videoId : null;
}