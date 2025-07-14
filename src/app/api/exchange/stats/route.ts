// src/app/api/exchange/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

// GET /api/exchange/stats - Get exchange statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get exchange statistics
    const { data: campaigns, error } = await supabase
      .from('active_campaigns')
      .select('id, user_id, remaining_credits')
      .eq('status', 'active')
      .neq('user_id', user.id)
      .gt('remaining_credits', 0);

    if (error) {
      console.error('Exchange stats error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    const stats = {
      activeCampaigns: campaigns?.length || 0,
      totalCreditsAvailable: campaigns?.reduce((sum, campaign) => sum + campaign.remaining_credits, 0) || 0,
      activeUsers: new Set(campaigns?.map(c => c.user_id)).size || 0
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Exchange stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
