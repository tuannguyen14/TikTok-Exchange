// app/api/exchange/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Use the optimized database function to get all stats in one call
        const { data: statsData, error: statsError } = await supabase
            .rpc('get_user_exchange_stats', { user_uuid: user.id });

        if (statsError) {
            console.error('Error fetching stats with database function:', statsError);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch exchange statistics'
            }, { status: 500 });
        }

        // Extract stats from the function result
        const rawStats = statsData?.[0];

        if (!rawStats) {
            return NextResponse.json({
                success: false,
                error: 'No statistics data found'
            }, { status: 404 });
        }

        // Format response to match the expected ExchangeStats interface
        const formattedStats = {
            totalCampaigns: rawStats.total_campaigns_available || 0,
            activeCampaigns: rawStats.active_campaigns_available || 0,
            completedActions: rawStats.completed_actions || 0,
            pendingActions: rawStats.pending_actions || 0,
            totalCreditsEarned: rawStats.total_credits_earned || 0,
            currentCredits: rawStats.current_credits || 0
        };

        return NextResponse.json({
            success: true,
            data: formattedStats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in exchange stats API:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}