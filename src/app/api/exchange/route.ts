// src/app/api/exchange/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

// GET /api/exchange - Get available campaigns for exchange
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const interaction_type = searchParams.get('interaction_type');
    const category = searchParams.get('category');
    const min_credits = searchParams.get('min_credits');
    const max_credits = searchParams.get('max_credits');
    const search = searchParams.get('search');

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
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

    // Build query for available campaigns
    let query = supabase
      .from('active_campaigns')
      .select(`
        id,
        user_id,
        interaction_type,
        credits_per_action,
        target_count,
        current_count,
        remaining_credits,
        created_at,
        creator_tiktok,
        videos!inner(
          title,
          description,
          category,
          video_url
        )
      `)
      .eq('status', 'active')
      .neq('user_id', user.id) // Don't show user's own campaigns
      .gt('remaining_credits', 0)
      .lt('current_count', supabase.raw('target_count')); // Not completed

    // Apply filters
    if (interaction_type && ['like', 'comment', 'follow', 'view'].includes(interaction_type)) {
      query = query.eq('interaction_type', interaction_type);
    }

    if (category) {
      query = query.eq('videos.category', category);
    }

    if (min_credits) {
      const minVal = parseInt(min_credits);
      if (!isNaN(minVal) && minVal > 0) {
        query = query.gte('credits_per_action', minVal);
      }
    }

    if (max_credits) {
      const maxVal = parseInt(max_credits);
      if (!isNaN(maxVal) && maxVal > 0) {
        query = query.lte('credits_per_action', maxVal);
      }
    }

    // Simple search by video title
    if (search && search.trim()) {
      query = query.ilike('videos.title', `%${search.trim()}%`);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('Exchange campaigns fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('active_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('user_id', user.id)
      .gt('remaining_credits', 0)
      .lt('current_count', supabase.raw('target_count'));

    // Apply same filters for count
    if (interaction_type && ['like', 'comment', 'follow', 'view'].includes(interaction_type)) {
      countQuery = countQuery.eq('interaction_type', interaction_type);
    }
    if (category) {
      countQuery = countQuery.eq('videos.category', category);
    }
    if (min_credits) {
      const minVal = parseInt(min_credits);
      if (!isNaN(minVal) && minVal > 0) {
        countQuery = countQuery.gte('credits_per_action', minVal);
      }
    }
    if (max_credits) {
      const maxVal = parseInt(max_credits);
      if (!isNaN(maxVal) && maxVal > 0) {
        countQuery = countQuery.lte('credits_per_action', maxVal);
      }
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    // Format campaigns data
    const formattedCampaigns = campaigns?.map(campaign => ({
      ...campaign,
      videos: campaign.videos ? [campaign.videos] : []
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });

  } catch (error) {
    console.error('Exchange API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


