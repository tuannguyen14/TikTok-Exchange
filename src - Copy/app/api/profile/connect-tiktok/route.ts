// src/app/api/profile/connect-tiktok/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Clean username (remove @ if present)
        const cleanUsername = username.replace('@', '').trim();

        if (!cleanUsername) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }

        // Verify TikTok account exists using the existing TikTok API
        const tiktokResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tiktok?action=getProfile&id=${encodeURIComponent(cleanUsername)}`);

        if (!tiktokResponse.ok) {
            return NextResponse.json({ error: 'Failed to verify TikTok account' }, { status: 400 });
        }

        const tiktokData = await tiktokResponse.json();

        if (!tiktokData.success || !tiktokData.data?.user) {
            return NextResponse.json({ error: 'TikTok account not found' }, { status: 400 });
        }

        // Check if TikTok username is already taken by another user
        const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('tiktok_username', cleanUsername)
            .neq('id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (existingProfile) {
            return NextResponse.json({ error: 'This TikTok username is already connected to another account' }, { status: 400 });
        }

        // Update profile with TikTok username and stats
        const tiktokStats = {
            followerCount: tiktokData.data.stats?.followerCount || 0,
            followingCount: tiktokData.data.stats?.followingCount || 0,
            heartCount: tiktokData.data.stats?.heartCount || 0,
            videoCount: tiktokData.data.stats?.videoCount || 0,
            diggCount: tiktokData.data.stats?.diggCount || 0,
            friendCount: tiktokData.data.stats?.friendCount || 0,
        };

        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                tiktok_username: cleanUsername,
                tiktok_stats: tiktokStats,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to connect TikTok account' }, { status: 500 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Error connecting TikTok:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}