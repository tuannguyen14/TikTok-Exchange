// src/app/api/campaigns/[id]/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server";
import { PerformActionRequest } from '@/types/campaign';

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/campaigns/[id]/actions - Perform action on campaign
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: campaignId } = await params
        const { action_type, proof_data }: PerformActionRequest = await request.json()

        if (!action_type || !['like', 'comment', 'follow', 'view'].includes(action_type)) {
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

        // Use the database function to process the action
        const { data: result, error } = await supabase.rpc('process_action', {
            p_user_id: user.id,
            p_campaign_id: campaignId,
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

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                credits_earned: result.credits_earned,
                message: `${action_type} action completed! +${result.credits_earned} credits`
            }
        })
    } catch (error) {
        console.error('Perform action error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET /api/campaigns/[id]/actions - Get campaign actions history
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: campaignId } = await params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const supabase = await createServerSupabaseClient()

        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Check if user owns the campaign
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('user_id')
            .eq('id', campaignId)
            .single()

        if (campaignError || !campaign || campaign.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found or unauthorized' },
                { status: 404 }
            )
        }

        const offset = (page - 1) * limit

        const { data: actions, error } = await supabase
            .from('actions')
            .select(`
        *,
        profiles!inner(email)
      `)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Get actions error:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch actions' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: actions || []
        })
    } catch (error) {
        console.error('Get campaign actions error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}