// lib/utils/server-api.ts

// Helper function to get base URL for server-side API calls
export function getServerBaseUrl(): string {
    // In production, use the environment variable
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // In development, use localhost
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }

    // Fallback for Vercel deployments
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Default fallback
    return 'http://localhost:3000';
}

// Helper function to call TikTok API from server
export async function callTikTokApi(action: string, params: Record<string, string>) {
    try {
        const baseUrl = getServerBaseUrl();
        const searchParams = new URLSearchParams({
            action,
            ...params
        });

        const response = await fetch(`${baseUrl}/api/tiktok?${searchParams.toString()}`, {
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
        console.error('Error calling TikTok API:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Specific helper functions
export async function getTikTokVideoInfo(videoLink: string) {
    return callTikTokApi('getVideoInfo', { videoLink });
}

export async function getTikTokProfile(username: string) {
    return callTikTokApi('getProfile', { id: username });
}

export async function getTikTokFollowers(username: string) {
    return callTikTokApi('getFollowers', { id: username });
}