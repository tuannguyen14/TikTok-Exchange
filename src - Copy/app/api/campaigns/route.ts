// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = session.user.id;

    switch (action) {
      case 'list':
        const status = searchParams.get('status');
        const campaignType = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq('status', status);
        }
        if (campaignType) {
          query = query.eq('campaign_type', campaignType);
        }

        const { data: campaigns, error: campaignError } = await query;

        if (campaignError) {
          return NextResponse.json({ error: campaignError.message }, { status: 500 });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (status) {
          countQuery = countQuery.eq('status', status);
        }
        if (campaignType) {
          countQuery = countQuery.eq('campaign_type', campaignType);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          return NextResponse.json({ error: countError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: {
            campaigns,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit)
            }
          }
        });

      case 'stats':
        const { data: stats, error: statsError } = await supabase
          .from('campaigns')
          .select('status, campaign_type, total_credits, current_count, target_count')
          .eq('user_id', userId);

        if (statsError) {
          return NextResponse.json({ error: statsError.message }, { status: 500 });
        }

        const campaignStats = {
          total: stats.length,
          active: stats.filter(c => c.status === 'active').length,
          completed: stats.filter(c => c.status === 'completed').length,
          paused: stats.filter(c => c.status === 'paused').length,
          totalCreditsSpent: stats.reduce((sum, c) => sum + (c.total_credits || 0), 0),
          totalActionsReceived: stats.reduce((sum, c) => sum + (c.current_count || 0), 0),
          byType: {
            video: stats.filter(c => c.campaign_type === 'video').length,
            follow: stats.filter(c => c.campaign_type === 'follow').length
          }
        };

        return NextResponse.json({
          success: true,
          data: campaignStats
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Campaigns API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        const {
          campaign_type,
          tiktok_video_id,
          target_tiktok_username,
          interaction_type,
          credits_per_action,
          target_count
        } = body;

        const total_credits = credits_per_action * target_count;

        // Check user's credits balance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (profile.credits < total_credits) {
          return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }

        // Start transaction
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            user_id: userId,
            campaign_type,
            tiktok_video_id,
            target_tiktok_username,
            interaction_type,
            credits_per_action,
            target_count,
            current_count: 0,
            total_credits,
            remaining_credits: total_credits,
            status: 'active'
          })
          .select()
          .single();

        if (campaignError) {
          return NextResponse.json({ error: campaignError.message }, { status: 500 });
        }

        // Deduct credits from user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: profile.credits - total_credits })
          .eq('id', userId);

        if (updateError) {
          // Rollback campaign creation
          await supabase.from('campaigns').delete().eq('id', campaign.id);
          return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'spend',
            amount: -total_credits,
            balance_after: profile.credits - total_credits,
            description: `Campaign created: ${campaign_type}`,
            reference_id: campaign.id,
            reference_type: 'campaign'
          });

        if (transactionError) {
          console.error('Transaction record error:', transactionError);
        }

        return NextResponse.json({
          success: true,
          data: campaign
        });

      case 'update':
        const { id, status, credits_per_action: newCreditsPerAction } = body;

        // Get current campaign
        const { data: currentCampaign, error: getCampaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (getCampaignError || !currentCampaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (newCreditsPerAction) updateData.credits_per_action = newCreditsPerAction;

        const { data: updatedCampaign, error: updateCampaignError } = await supabase
          .from('campaigns')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateCampaignError) {
          return NextResponse.json({ error: updateCampaignError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: updatedCampaign
        });

      case 'delete':
        const { id: campaignId } = body;

        // Get campaign details for refund
        const { data: campaignToDelete, error: getCampaignToDeleteError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .eq('user_id', userId)
          .single();

        if (getCampaignToDeleteError || !campaignToDelete) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Check if campaign can be deleted (not completed)
        if (campaignToDelete.status === 'completed') {
          return NextResponse.json({ error: 'Cannot delete completed campaign' }, { status: 400 });
        }

        // Delete campaign
        const { error: deleteCampaignError } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', campaignId)
          .eq('user_id', userId);

        if (deleteCampaignError) {
          return NextResponse.json({ error: deleteCampaignError.message }, { status: 500 });
        }

        // Refund remaining credits
        const refundAmount = campaignToDelete.remaining_credits;
        if (refundAmount > 0) {
          const { data: currentProfile, error: getProfileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

          if (!getProfileError && currentProfile) {
            await supabase
              .from('profiles')
              .update({ credits: currentProfile.credits + refundAmount })
              .eq('id', userId);

            // Create refund transaction
            await supabase
              .from('transactions')
              .insert({
                user_id: userId,
                type: 'refund',
                amount: refundAmount,
                balance_after: currentProfile.credits + refundAmount,
                description: `Campaign deleted - refund`,
                reference_id: campaignId,
                reference_type: 'campaign'
              });
          }
        }

        return NextResponse.json({
          success: true,
          data: { refunded: refundAmount }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Campaigns POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}