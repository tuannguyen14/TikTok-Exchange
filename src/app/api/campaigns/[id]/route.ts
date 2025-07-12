// src/app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/campaigns/[id] - Get specific campaign
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: campaign, error } = await supabase
      .from('active_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign
    })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[id] - Update campaign (pause/resume)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!['active', 'paused'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be active or paused' },
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

    // Update campaign (only if user owns it)
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the campaign
      .select()
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: `Campaign ${status} successfully`
    })
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id] - Delete campaign (only if no actions yet)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if campaign exists and user owns it
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, current_count, remaining_credits')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or unauthorized' },
        { status: 404 }
      )
    }

    // Don't allow deletion if campaign has received actions
    if (campaign.current_count > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete campaign that has received actions' },
        { status: 400 }
      )
    }

    // Delete campaign and refund credits
    const { error: deleteError } = await supabase.rpc('delete_campaign_with_refund', {
      p_campaign_id: id,
      p_user_id: user.id
    })

    if (deleteError) {
      console.error('Delete campaign error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted and credits refunded'
    })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

