// app/api/exchange/perform-action/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';    

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    const { campaignId, actionType, proofData } = body;

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
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 });
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

    // Validate campaign status
    if (campaign.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign is not active' 
      }, { status: 400 });
    }

    // Check if campaign has remaining credits
    if (campaign.remaining_credits < campaign.credits_per_action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign has insufficient credits' 
      }, { status: 400 });
    }

    // Check if target is reached
    if (campaign.current_count >= campaign.target_count) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign target has been reached' 
      }, { status: 400 });
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

    // Prevent users from performing actions on their own campaigns
    if (campaign.user_id === user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You cannot perform actions on your own campaigns' 
      }, { status: 400 });
    }

    try {
      // Insert action - triggers will handle everything automatically:
      // 1. Update campaign current_count and remaining_credits
      // 2. Update user credits and total_earned
      // 3. Create transaction record
      // 4. Create notification
      // 5. Auto-complete campaign if needed
      const { data: action, error: actionError } = await supabase
        .from('actions')
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          action_type: actionType,
          credits_earned: campaign.credits_per_action,
          status: 'completed',
          proof_data: proofData || null
        })
        .select()
        .single();

      if (actionError) {
        console.error('Error creating action:', actionError);
        
        // Handle specific trigger errors
        if (actionError.message?.includes('insufficient credits')) {
          return NextResponse.json({ 
            success: false, 
            error: 'Campaign has insufficient credits' 
          }, { status: 400 });
        }
        
        if (actionError.message?.includes('target already reached')) {
          return NextResponse.json({ 
            success: false, 
            error: 'Campaign target has been reached' 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create action' 
        }, { status: 500 });
      }

      // Get updated profile to return new balance
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      return NextResponse.json({ 
        success: true, 
        data: {
          action,
          creditsEarned: campaign.credits_per_action,
          newBalance: updatedProfile?.credits || 0
        }
      });

    } catch (error) {
      console.error('Database error in perform-action:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Database operation failed' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in perform-action API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}