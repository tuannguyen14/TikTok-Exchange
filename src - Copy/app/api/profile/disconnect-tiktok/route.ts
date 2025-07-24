// src/app/api/profile/disconnect-tiktok/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function POST() {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update profile to remove TikTok connection
        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                tiktok_username: null,
                tiktok_stats: null,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to disconnect TikTok account' }, { status: 500 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Error disconnecting TikTok:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}