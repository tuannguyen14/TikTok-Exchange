// src/app/api/exchange/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

interface PerformActionRequest {
  campaign_id: string;
  action_type: 'like' | 'comment' | 'follow' | 'view';
  proof_data?: any;
}

// POST /api/exchange/action - Perform action on a campaign
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

    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use the database function to process the action
    const { data: result, error } = await supabase.rpc('process_action', {
      p_user_id: user.id,
      p_campaign_id: campaign_id,
      p_action_type: action_type,
      p_proof_data: proof_data || {}
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