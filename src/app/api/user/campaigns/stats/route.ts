// src/app/api/campaigns/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get campaign statistics using the database function
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('get_campaign_analytics', { p_user_id: user.id })

    if (analyticsError) {
      console.error('Campaign analytics error:', analyticsError)
    }

    // Get user action statistics
    const { data: actionData, error: actionError } = await supabase
      .rpc('get_user_action_stats', { p_user_id: user.id })

    if (actionError) {
      console.error('User action stats error:', actionError)
    }

    // Fallback to manual queries if functions don't exist
    let campaignStats = {
      total_campaigns: 0,
      active_campaigns: 0,
      completed_campaigns: 0,
      total_credits_spent: 0,
      total_actions_received: 0,
      interaction_breakdown: {}
    }

    let userActionStats = {
      total_actions: 0,
      total_credits_earned: 0,
      action_breakdown: {}
    }

    if (!analyticsData) {
      // Manual campaign stats query
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          status,
          interaction_type,
          current_count,
          total_credits,
          remaining_credits,
          target_count
        `)
        .eq('user_id', user.id)

      if (!campaignsError && campaigns) {
        campaignStats = {
          total_campaigns: campaigns.length,
          active_campaigns: campaigns.filter(c => c.status === 'active').length,
          completed_campaigns: campaigns.filter(c => c.status === 'completed').length,
          total_credits_spent: campaigns.reduce((sum, c) => 
            sum + (c.total_credits - c.remaining_credits), 0),
          total_actions_received: campaigns.reduce((sum, c) => sum + c.current_count, 0),
          interaction_breakdown: campaigns.reduce((acc, campaign) => {
            const type = campaign.interaction_type
            if (!acc[type]) {
              acc[type] = { count: 0, actions: 0, credits: 0 }
            }
            acc[type].count += 1
            acc[type].actions += campaign.current_count
            acc[type].credits += (campaign.total_credits - campaign.remaining_credits)
            return acc
          }, {} as Record<string, { count: number; actions: number; credits: number }>)
        }
      }
    } else {
      campaignStats = analyticsData
    }

    if (!actionData) {
      // Manual user actions query
      const { data: actions, error: actionsError } = await supabase
        .from('actions')
        .select(`
          id,
          action_type,
          credits_earned,
          created_at
        `)
        .eq('user_id', user.id)

      if (!actionsError && actions) {
        userActionStats = {
          total_actions: actions.length,
          total_credits_earned: actions.reduce((sum, a) => sum + a.credits_earned, 0),
          action_breakdown: actions.reduce((acc, action) => {
            const type = action.action_type
            if (!acc[type]) {
              acc[type] = { count: 0, credits: 0 }
            }
            acc[type].count += 1
            acc[type].credits += action.credits_earned
            return acc
          }, {} as Record<string, { count: number; credits: number }>)
        }
      }
    } else {
      userActionStats = actionData
    }

    // Get recent actions on user's campaigns (what others did on user's campaigns)
    const { data: recentActions, error: recentActionsError } = await supabase
      .from('actions')
      .select(`
        id,
        action_type,
        credits_earned,
        created_at,
        campaigns!inner(user_id),
        profiles!inner(email)
      `)
      .eq('campaigns.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCampaigns: campaignStats.total_campaigns,
          activeCampaigns: campaignStats.active_campaigns,
          completedCampaigns: campaignStats.completed_campaigns,
          totalCreditsSpent: campaignStats.total_credits_spent,
          totalActionsReceived: campaignStats.total_actions_received
        },
        interactionBreakdown: campaignStats.interaction_breakdown,
        userActions: {
          totalActions: userActionStats.total_actions,
          totalCreditsEarned: userActionStats.total_credits_earned,
          actionBreakdown: userActionStats.action_breakdown
        },
        recentActions: recentActions || []
      }
    })

  } catch (error) {
    console.error('Campaign stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}