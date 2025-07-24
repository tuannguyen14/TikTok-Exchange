// app/api/exchange/verify-action/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import { getTikTokFollowers, getTikTokVideoInfo } from '@/lib/utils/server-api';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const body = await request.json();

        const { campaignId, actionType, videoLink, targetUsername } = body;

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

        if (!profile || !profile.tiktok_username) {
            return NextResponse.json({
                success: false,
                error: 'Please connect your TikTok account first'
            }, { status: 400 });
        }

        // Get campaign details
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({
                success: false,
                error: 'Campaign not found'
            }, { status: 404 });
        }

        // Check if user has already performed this action
        const { data: existingAction } = await supabase
            .from('actions')
            .select('*')
            .eq('user_id', user.id)
            .eq('campaign_id', campaignId)
            .eq('action_type', actionType)
            .single();

        if (existingAction) {
            return NextResponse.json({
                success: false,
                error: 'You have already completed this action'
            }, { status: 400 });
        }

        // Verify based on action type
        if (actionType === 'follow') {
            // Verify follow action
            const followersResponse = await getTikTokFollowers(targetUsername || campaign.target_tiktok_username);

            if (!followersResponse.success) {
                return NextResponse.json({
                    success: false,
                    error: 'Failed to fetch followers list'
                }, { status: 500 });
            }

            const userList = followersResponse.data?.responseData?.userList || [];
            const isFollowing = userList.some(
                (follower: any) => follower.user.uniqueId === profile.tiktok_username
            );

            return NextResponse.json({
                success: true,
                data: {
                    verified: isFollowing,
                    isFollowing
                }
            });

        } else if (actionType === 'like') {
            // Verify like action by checking digg count
            const videoResponse = await getTikTokVideoInfo(videoLink);

            if (!videoResponse.success) {
                return NextResponse.json({
                    success: false,
                    error: 'Failed to fetch video information'
                }, { status: 500 });
            }

            const currentDiggCount = videoResponse.data?.diggCount || 0;

            // Return current count for comparison
            return NextResponse.json({
                success: true,
                data: {
                    verified: true,
                    currentCount: currentDiggCount,
                    videoData: videoResponse.data
                }
            });

        } else {
            return NextResponse.json({
                success: false,
                error: 'Action type not supported for verification'
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Error in verify-action API:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}