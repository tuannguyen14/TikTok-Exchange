// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server";
import { CreateCampaignRequest } from '@/types/campaign';

// GET /api/campaigns - Fetch available campaigns for interaction
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const interaction_type = searchParams.get('interaction_type')
        const category = searchParams.get('category')
        const min_credits = searchParams.get('min_credits')
        const max_credits = searchParams.get('max_credits')

        const supabase = await createServerSupabaseClient()

        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            )
        }

        let query = supabase
            .from('active_campaigns')
            .select(`
        *,
        videos!inner(title, description, category)
      `)
            .eq('status', 'active')
            .neq('user_id', user.id) // Don't show user's own campaigns
            .gt('remaining_credits', 0)

        // Apply filters
        if (interaction_type) {
            query = query.eq('interaction_type', interaction_type)
        }
        if (category) {
            query = query.eq('videos.category', category)
        }
        if (min_credits) {
            query = query.gte('credits_per_action', parseInt(min_credits))
        }
        if (max_credits) {
            query = query.lte('credits_per_action', parseInt(max_credits))
        }

        // Add pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        // Order by creation date (newest first)
        query = query.order('created_at', { ascending: false })

        const { data: campaigns, error, count } = await query

        if (error) {
            console.error('Campaigns fetch error:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch campaigns' },
                { status: 500 }
            )
        }

        // Get total count for pagination
        const { count: totalCount, error: countError } = await supabase
            .from('active_campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .neq('user_id', user.id)
            .gt('remaining_credits', 0)

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
        console.error('Campaigns API error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
    try {
        const body: CreateCampaignRequest = await request.json()
        const {
            video_url,
            video_title,
            description,
            category,
            interaction_type,
            target_count,
            credits_per_action
        } = body

        // Validation
        if (!video_url || !interaction_type || !target_count || !credits_per_action) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate credit values (1/2/3/5 credits rule)
        const validCredits = { view: 1, like: 2, comment: 3, follow: 5 }
        if (credits_per_action !== validCredits[interaction_type]) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid credits for ${interaction_type}. Must be ${validCredits[interaction_type]}`
                },
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

        // Get user profile to check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { success: false, error: 'User profile not found' },
                { status: 404 }
            )
        }

        const totalCampaignCost = target_count * credits_per_action
        if (profile.credits < totalCampaignCost) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Insufficient credits. Need ${totalCampaignCost}, have ${profile.credits}`
                },
                { status: 400 }
            )
        }

        // Extract TikTok video ID from URL
        const tiktokVideoId = extractTikTokVideoId(video_url)
        if (!tiktokVideoId) {
            return NextResponse.json(
                { success: false, error: 'Invalid TikTok URL' },
                { status: 400 }
            )
        }

        // Start transaction
        const { data, error } = await supabase.rpc('create_campaign_transaction', {
            p_user_id: user.id,
            p_video_url: video_url,
            p_tiktok_video_id: tiktokVideoId,
            p_video_title: video_title || '',
            p_description: description || '',
            p_category: category || 'general',
            p_interaction_type: interaction_type,
            p_target_count: target_count,
            p_credits_per_action: credits_per_action,
            p_total_credits: totalCampaignCost
        })

        if (error) {
            console.error('Campaign creation error:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to create campaign' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                campaign_id: data,
                message: 'Campaign created successfully'
            }
        })
    } catch (error) {
        console.error('Create campaign error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to extract TikTok video ID from URL
function extractTikTokVideoId(url: string): string | null {
    try {
        const regex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/
        const match = url.match(regex)
        return match ? match[1] : null
    } catch {
        return null
    }
}