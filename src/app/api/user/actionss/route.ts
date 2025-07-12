// src/app/api/user/actions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

// GET /api/user/actions - Get user's action history (actions they performed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action_type = searchParams.get('action_type')

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Build query for user actions
    let actionsQuery = supabase
      .from('actions')
      .select(`
        id,
        action_type,
        credits_earned,
        status,
        created_at,
        campaigns!inner(
          id,
          interaction_type,
          user_id,
          videos!inner(
            id,
            title,
            video_url,
            thumbnail_url,
            category
          )
        ),
        videos!inner(
          id,
          title,
          video_url,
          thumbnail_url,
          category
        )
      `)
      .eq('user_id', user.id)

    // Apply action type filter if provided
    if (action_type && ['like', 'comment', 'follow', 'view'].includes(action_type)) {
      actionsQuery = actionsQuery.eq('action_type', action_type)
    }

    // Add pagination
    const offset = (page - 1) * limit
    actionsQuery = actionsQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: actions, error: actionsError } = await actionsQuery

    if (actionsError) {
      console.error('User actions fetch error:', actionsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch actions' },
        { status: 500 }
      )
    }

    // Get total credits earned
    const { data: totalStats, error: statsError } = await supabase
      .from('actions')
      .select('credits_earned')
      .eq('user_id', user.id)

    const totalCreditsEarned = totalStats?.reduce((sum, action) => sum + action.credits_earned, 0) || 0

    // Get action type breakdown
    const { data: actionBreakdown, error: breakdownError } = await supabase
      .from('actions')
      .select('action_type, credits_earned')
      .eq('user_id', user.id)

    const breakdown = actionBreakdown?.reduce((acc, action) => {
      const type = action.action_type
      if (!acc[type]) {
        acc[type] = { count: 0, credits: 0 }
      }
      acc[type].count += 1
      acc[type].credits += action.credits_earned
      return acc
    }, {} as Record<string, { count: number; credits: number }>) || {}

    // Get total count for pagination
    let countQuery = supabase
      .from('actions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (action_type && ['like', 'comment', 'follow', 'view'].includes(action_type)) {
      countQuery = countQuery.eq('action_type', action_type)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Count query error:', countError)
    }

    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        actions: actions || [],
        stats: {
          totalCreditsEarned,
          totalActions: totalCount || 0,
          actionBreakdown: breakdown
        },
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages,
          hasMore: page < totalPages
        }
      }
    })

  } catch (error) {
    console.error('User actions API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/actions - Create new action (for testing purposes)
export async function POST(request: NextRequest) {
  try {
    const { campaign_id, action_type, proof_data } = await request.json()

    if (!campaign_id || !action_type) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and action type are required' },
        { status: 400 }
      )
    }

    if (!['like', 'comment', 'follow', 'view'].includes(action_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use the existing process_action function from the database
    const { data: result, error } = await supabase.rpc('process_action', {
      p_user_id: user.id,
      p_campaign_id: campaign_id,
      p_action_type: action_type,
      p_proof_data: proof_data || {}
    })

    if (error) {
      console.error('Process action error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to process action' },
        { status: 400 }
      )
    }

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.message || 'Action failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        credits_earned: result.credits_earned,
        message: `${action_type} action completed successfully! +${result.credits_earned} credits earned`
      }
    })

  } catch (error) {
    console.error('Create action API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}