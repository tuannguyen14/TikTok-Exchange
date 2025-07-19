// app/api/exchange/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import { getTikTokProfile, getTikTokVideoInfo } from '@/lib/utils/server-api';


export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const type = searchParams.get('type') as 'video' | 'follow' | null;
        const status = searchParams.get('status') as 'active' | 'completed' | null;
        const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'highestCredits' | 'lowestCredits' | null;

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
        }

        // Build query
        let query = supabase
            .from('campaigns')
            .select('*')
            .neq('user_id', user.id); // Exclude user's own campaigns

        // Apply filters
        if (type) {
            query = query.eq('campaign_type', type);
        }

        if (status) {
            query = query.eq('status', status);
        } else {
            // Default to active campaigns
            query = query.eq('status', 'active');
        }

        // Apply sorting
        switch (sortBy) {
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'highestCredits':
                query = query.order('credits_per_action', { ascending: false });
                break;
            case 'lowestCredits':
                query = query.order('credits_per_action', { ascending: true });
                break;
            case 'newest':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        const { data: campaigns, error } = await query;

        if (error) {
            console.error('Error fetching campaigns:', error);
            return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
        }

        // Enrich campaigns with TikTok data
        const enrichedCampaigns = await Promise.all(
            campaigns.map(async (campaign) => {
                try {
                    if (campaign.campaign_type === 'video' && campaign.tiktok_video_id && campaign.target_tiktok_username) {
                        // Get video info from TikTok API
                        const videoUrl = `https://www.tiktok.com/@${campaign.target_tiktok_username}/video/${campaign.tiktok_video_id}`;
                        const videoInfo = await getTikTokVideoInfo(videoUrl);

                        if (videoInfo.success) {
                            campaign.video_info = videoInfo.data;
                        }
                    } else if (campaign.campaign_type === 'follow' && campaign.target_tiktok_username) {
                        // Get user profile from TikTok API
                        const userInfo = await getTikTokProfile(campaign.target_tiktok_username);

                        if (userInfo.success) {
                            campaign.user_info = {
                                uniqueId: userInfo.data.user.uniqueId,
                                nickname: userInfo.data.user.nickname,
                                avatarThumb: userInfo.data.user.avatarThumb,
                                followerCount: userInfo.data.stats.followerCount,
                                followingCount: userInfo.data.stats.followingCount,
                                verified: userInfo.data.user.verified
                            };
                        }
                    }
                } catch (error) {
                    console.error('Error enriching campaign:', error);
                    // Continue without enrichment if TikTok API fails
                }

                return campaign;
            })
        );

        return NextResponse.json({
            success: true,
            data: enrichedCampaigns
        });

    } catch (error) {
        console.error('Error in campaigns API:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}