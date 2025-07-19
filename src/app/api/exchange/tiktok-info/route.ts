// app/api/exchange/tiktok-info/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTikTokProfile, getTikTokVideoInfo } from '@/lib/utils/server-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'video' | 'profile';
        const username = searchParams.get('username');
        const videoId = searchParams.get('videoId');

        if (!type || !username) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters'
            }, { status: 400 });
        }

        if (type === 'video') {
            if (!videoId) {
                return NextResponse.json({
                    success: false,
                    error: 'Video ID is required for video type'
                }, { status: 400 });
            }

            const videoUrl = `https://www.tiktok.com/@${username}/video/${videoId}`;
            const videoInfo = await getTikTokVideoInfo(videoUrl);

            if (videoInfo.success) {
                return NextResponse.json({
                    success: true,
                    data: {
                        video_info: videoInfo.data
                    }
                });
            } else {
                return NextResponse.json({
                    success: false,
                    error: videoInfo.error || 'Failed to fetch video info'
                }, { status: 500 });
            }
        } else if (type === 'profile') {
            const userInfo = await getTikTokProfile(username);

            if (userInfo.success) {
                return NextResponse.json({
                    success: true,
                    data: {
                        user_info: {
                            uniqueId: userInfo.data.user.uniqueId,
                            nickname: userInfo.data.user.nickname,
                            avatarThumb: userInfo.data.user.avatarThumb,
                            followerCount: userInfo.data.stats.followerCount,
                            followingCount: userInfo.data.stats.followingCount,
                            verified: userInfo.data.user.verified
                        }
                    }
                });
            } else {
                return NextResponse.json({
                    success: false,
                    error: userInfo.error || 'Failed to fetch profile info'
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: false,
            error: 'Invalid type parameter'
        }, { status: 400 });

    } catch (error) {
        console.error('Error in TikTok info API:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}