// src/app/api/user/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

// GET /api/user/campaigns - Get user's own campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const interaction_type = searchParams.get('interaction_type')

    const supabase = await createServerSupabaseClient()

    console.log("use campaign")

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('campaigns')
      .select(`
        *,
        videos!inner(
          title,
          description,
          video_url,
          thumbnail_url,
          category,
          tiktok_video_id
        )
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type)
    }

    // Add pagination
    const offset = (page - 1) * limit
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: campaigns, error } = await query

    console.log(campaigns)

    if (error) {
      console.error('User campaigns fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaigns || [],
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
    console.error('User campaigns API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}