// src/app/api/exchange/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

interface PerformActionRequest {
  campaign_id: string;
  action_type: 'like' | 'comment' | 'follow' | 'view';
  proof_data?: {
    verified: boolean;
    initialCount?: number;
    newCount?: number;
    userFound?: boolean;
  };
}

// POST /api/exchange/action - Perform action on a campaign with verification
export async function POST(request: NextRequest) {
  try {
    const { campaign_id, action_type, proof_data }: PerformActionRequest = await request.json();

    // Validate input
    if (!campaign_id || !action_type) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and action type are required' },
        { status: 400 }
      );
    }

    if (!['like', 'comment', 'follow', 'view'].includes(action_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Validate verification data
    if (!proof_data?.verified) {
      return NextResponse.json(
        { success: false, error: 'Action verification required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has TikTok username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tiktok_username, credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.tiktok_username) {
      return NextResponse.json(
        { success: false, error: 'TikTok account must be connected to participate' },
        { status: 400 }
      );
    }

    // Validate action-specific verification data
    if (action_type === 'like') {
      const { initialCount, newCount } = proof_data;
      if (typeof initialCount !== 'number' || typeof newCount !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Invalid like verification data' },
          { status: 400 }
        );
      }
      if (newCount <= initialCount) {
        return NextResponse.json(
          { success: false, error: 'Like count did not increase' },
          { status: 400 }
        );
      }
    } else if (action_type === 'follow') {
      if (!proof_data.userFound) {
        return NextResponse.json(
          { success: false, error: 'Follow verification failed' },
          { status: 400 }
        );
      }
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('status', 'active')
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or not active' },
        { status: 404 }
      );
    }

    // Check if campaign has enough credits
    if (campaign.remaining_credits < campaign.credits_per_action) {
      return NextResponse.json(
        { success: false, error: 'Campaign has insufficient credits' },
        { status: 400 }
      );
    }

    // Check if user already performed this action on this campaign
    const { data: existingAction, error: actionCheckError } = await supabase
      .from('actions')
      .select('id')
      .eq('user_id', user.id)
      .eq('campaign_id', campaign_id)
      .eq('action_type', action_type)
      .single();

    if (existingAction) {
      return NextResponse.json(
        { success: false, error: 'You have already performed this action on this campaign' },
        { status: 400 }
      );
    }

    // Check if user is trying to interact with their own campaign
    if (campaign.user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot interact with your own campaigns' },
        { status: 400 }
      );
    }

    // Check rate limiting (optional: prevent spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentActions, error: rateLimitError } = await supabase
      .from('actions')
      .select('id')
      .eq('user_id', user.id)
      .eq('action_type', action_type)
      .gte('created_at', oneHourAgo);

    if (recentActions && recentActions.length >= 20) {
      return NextResponse.json(
        { success: false, error: 'Too many actions. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // Use the database function to process the action
    const { data: result, error } = await supabase.rpc('process_action', {
      p_user_id: user.id,
      p_campaign_id: campaign_id,
      p_action_type: action_type,
      p_proof_data: proof_data
    });

    if (error) {
      console.error('Process action error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to process action' },
        { status: 400 }
      );
    }

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.message || 'Action failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        credits_earned: result.credits_earned,
        message: `${action_type} action completed! +${result.credits_earned} credits earned`
      }
    });

  } catch (error) {
    console.error('Exchange action API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}