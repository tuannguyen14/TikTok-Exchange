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

    // Build basic query for campaigns
    let query = supabase
      .from('campaigns')
      .select(`
        id,
        user_id,
        interaction_type,
        credits_per_action,
        target_count,
        current_count,
        remaining_credits,
        created_at,
        videos!inner(
          title,
          description,
          category,
          video_url
        ),
        profiles!inner(
          tiktok_username
        )
      `)
      .eq('status', 'active')
      .neq('user_id', user.id)
      .gt('remaining_credits', 0);

    // Apply basic filters at DB level
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

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: allCampaigns, error } = await query;

    if (error) {
      console.error('Exchange campaigns fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Filter out completed campaigns at application level
    const availableCampaigns = allCampaigns?.filter(campaign => 
      campaign.current_count < campaign.target_count
    ) || [];

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedCampaigns = availableCampaigns.slice(offset, offset + limit);

    const totalCount = availableCampaigns.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Format campaigns data to match expected structure
    const formattedCampaigns = paginatedCampaigns.map(campaign => ({
      id: campaign.id,
      user_id: campaign.user_id,
      interaction_type: campaign.interaction_type,
      credits_per_action: campaign.credits_per_action,
      target_count: campaign.target_count,
      current_count: campaign.current_count,
      remaining_credits: campaign.remaining_credits,
      created_at: campaign.created_at,
      creator_tiktok: campaign.profiles?.tiktok_username,
      videos: [{
        title: campaign.videos?.title,
        description: campaign.videos?.description,
        category: campaign.videos?.category,
        video_url: campaign.videos?.video_url
      }]
    }));

    return NextResponse.json({
      success: true,
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page,
          limit,
          total: totalCount,
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