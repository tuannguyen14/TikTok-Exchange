// API Route: src/app/api/action-credits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export interface ActionCreditValue {
    action_type: 'view' | 'like' | 'comment' | 'follow';
    credit_value: number;
}

export interface ActionCreditsResponse {
    success: boolean;
    data?: ActionCreditValue[];
    error?: string;
    message?: string;
}

// GET: Fetch all action credit values
export async function GET(request: NextRequest): Promise<NextResponse<ActionCreditsResponse>> {
    try {
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase
            .from('action_credit_values')
            .select('action_type, credit_value')
            .order('action_type', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch action credit values',
                message: error.message
            }, { status: 500 });
        }

        if (!data || data.length === 0) {
            // Return default values if no data exists
            const defaultValues: ActionCreditValue[] = [
                { action_type: 'view', credit_value: 1 },
                { action_type: 'like', credit_value: 2 },
                { action_type: 'comment', credit_value: 3 },
                { action_type: 'follow', credit_value: 5 }
            ];

            return NextResponse.json({
                success: true,
                data: defaultValues,
                message: 'Using default credit values'
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            data: data as ActionCreditValue[],
            message: 'Action credit values fetched successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST: Update action credit values (Admin only)
export async function POST(request: NextRequest): Promise<NextResponse<ActionCreditsResponse>> {
    try {
        const supabase = await createServerSupabaseClient();

        const body = await request.json();
        const { action_type, credit_value, auth_token } = body;

        // Basic validation
        if (!action_type || typeof credit_value !== 'number') {
            return NextResponse.json({
                success: false,
                error: 'Invalid input parameters',
                message: 'action_type and credit_value are required'
            }, { status: 400 });
        }

        // Validate action_type
        const validActionTypes = ['view', 'like', 'comment', 'follow'];
        if (!validActionTypes.includes(action_type)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid action type',
                message: `action_type must be one of: ${validActionTypes.join(', ')}`
            }, { status: 400 });
        }

        // Validate credit_value range
        if (credit_value < 0.01 || credit_value > 999.99) {
            return NextResponse.json({
                success: false,
                error: 'Invalid credit value',
                message: 'credit_value must be between 0.01 and 999.99'
            }, { status: 400 });
        }

        // TODO: Add proper authentication check
        // For now, we'll use a simple token check
        if (!auth_token || auth_token !== process.env.ADMIN_API_TOKEN) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
                message: 'Admin access required'
            }, { status: 401 });
        }

        // Upsert the credit value
        const { data, error } = await supabase
            .from('action_credit_values')
            .upsert({
                action_type,
                credit_value
            }, {
                onConflict: 'action_type'
            })
            .select();

        if (error) {
            console.error('Supabase upsert error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update action credit value',
                message: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: data as ActionCreditValue[],
            message: `Credit value for ${action_type} updated successfully`
        }, { status: 200 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT: Bulk update action credit values (Admin only)
export async function PUT(request: NextRequest): Promise<NextResponse<ActionCreditsResponse>> {
    try {
        const body = await request.json();
        const { credits, auth_token } = body;

        // Validate input
        if (!Array.isArray(credits) || credits.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid input',
                message: 'credits array is required'
            }, { status: 400 });
        }

        // TODO: Add proper authentication check
        if (!auth_token || auth_token !== process.env.ADMIN_API_TOKEN) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
                message: 'Admin access required'
            }, { status: 401 });
        }

        // Validate each credit entry
        const validActionTypes = ['view', 'like', 'comment', 'follow'];
        for (const credit of credits) {
            if (!validActionTypes.includes(credit.action_type)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action type',
                    message: `action_type must be one of: ${validActionTypes.join(', ')}`
                }, { status: 400 });
            }

            if (typeof credit.credit_value !== 'number' || credit.credit_value < 0.01 || credit.credit_value > 999.99) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid credit value',
                    message: 'credit_value must be a number between 0.01 and 999.99'
                }, { status: 400 });
            }
        }

        const supabase = await createServerSupabaseClient();
        // Bulk upsert
        const { data, error } = await supabase
            .from('action_credit_values')
            .upsert(credits, {
                onConflict: 'action_type'
            })
            .select();

        if (error) {
            console.error('Supabase bulk upsert error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update action credit values',
                message: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: data as ActionCreditValue[],
            message: 'Action credit values updated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}