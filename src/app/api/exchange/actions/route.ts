// app/api/exchange/actions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const campaignId = searchParams.get('campaignId');
    const actionType = searchParams.get('actionType') as 'view' | 'like' | 'comment' | 'follow' | null;
    const status = searchParams.get('status') as 'completed' | 'pending' | 'rejected' | null;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('actions')
      .select(`
        *,
        campaigns (
          id,
          campaign_type,
          tiktok_video_id,
          target_tiktok_username,
          interaction_type,
          credits_per_action
        )
      `)
      .eq('user_id', user.id);

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Order by most recent
    query = query.order('created_at', { ascending: false });

    const { data: actions, error } = await query;

    if (error) {
      console.error('Error fetching actions:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch actions' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: actions 
    });

  } catch (error) {
    console.error('Error in actions API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}