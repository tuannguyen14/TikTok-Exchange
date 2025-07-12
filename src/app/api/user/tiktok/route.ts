// src/app/api/user/tiktok/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

interface ConnectTikTokRequest {
  tiktok_username: string;
}

interface TikTokProfileResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      uniqueId: string;
      nickname: string;
      avatarLarger: string;
      avatarMedium: string;
      avatarThumb: string;
      signature: string;
      verified: boolean;
      privateAccount: boolean;
    };
    stats: {
      followerCount: number;
      followingCount: number;
      heartCount: number;
      videoCount: number;
    };
  };
  error?: string;
}

// GET /api/user/tiktok?username=xxx - Verify TikTok profile before connecting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
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

    // Validate TikTok username format
    if (!/^[a-zA-Z0-9._]{1,24}$/.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Invalid TikTok username format' },
        { status: 400 }
      );
    }

    // Check if TikTok username is already taken by another user
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('tiktok_username', username)
      .neq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: `TikTok username @${username} is already connected to another account (${existingProfile.email})` 
        },
        { status: 409 }
      );
    }

    // Fetch TikTok profile data
    try {
      const tiktokResponse = await fetch(`${request.nextUrl.origin}/api/tiktok?action=getProfile&id=${username}`);
      const tiktokData: TikTokProfileResponse = await tiktokResponse.json();

      if (!tiktokData.success || !tiktokData.data) {
        return NextResponse.json(
          { 
            success: false, 
            error: `TikTok profile @${username} not found or is private. Please check the username and make sure the profile is public.` 
          },
          { status: 404 }
        );
      }

      // Return TikTok profile data for verification
      return NextResponse.json({
        success: true,
        data: {
          username: tiktokData.data.user.uniqueId,
          nickname: tiktokData.data.user.nickname,
          avatar: tiktokData.data.user.avatarMedium,
          verified: tiktokData.data.user.verified,
          privateAccount: tiktokData.data.user.privateAccount,
          signature: tiktokData.data.user.signature,
          stats: {
            followers: tiktokData.data.stats.followerCount,
            following: tiktokData.data.stats.followingCount,
            likes: tiktokData.data.stats.heartCount,
            videos: tiktokData.data.stats.videoCount
          }
        }
      });

    } catch (tiktokError) {
      console.error('TikTok API error:', tiktokError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Unable to verify TikTok profile @${username}. The profile might be private or the username might be incorrect.` 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('TikTok verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/tiktok - Connect TikTok account
export async function POST(request: NextRequest) {
  try {
    const { tiktok_username }: ConnectTikTokRequest = await request.json();

    if (!tiktok_username) {
      return NextResponse.json(
        { success: false, error: 'TikTok username is required' },
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

    // Validate TikTok username format
    if (!/^[a-zA-Z0-9._]{1,24}$/.test(tiktok_username)) {
      return NextResponse.json(
        { success: false, error: 'Invalid TikTok username format' },
        { status: 400 }
      );
    }

    // Check if TikTok username is already taken by another user
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('tiktok_username', tiktok_username)
      .neq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: `TikTok username @${tiktok_username} is already connected to another account` 
        },
        { status: 409 }
      );
    }

    // Verify TikTok profile exists
    try {
      const tiktokResponse = await fetch(`${request.nextUrl.origin}/api/tiktok?action=getProfile&id=${tiktok_username}`);
      const tiktokData: TikTokProfileResponse = await tiktokResponse.json();

      if (!tiktokData.success || !tiktokData.data) {
        return NextResponse.json(
          { 
            success: false, 
            error: `TikTok profile @${tiktok_username} not found or is private` 
          },
          { status: 404 }
        );
      }

      // Check if account is private
      if (tiktokData.data.user.privateAccount) {
        return NextResponse.json(
          { 
            success: false, 
            error: `TikTok profile @${tiktok_username} is private. Please make your profile public to connect.` 
          },
          { status: 400 }
        );
      }

    } catch (tiktokError) {
      console.error('TikTok verification error:', tiktokError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Unable to verify TikTok profile @${tiktok_username}. Please check the username.` 
        },
        { status: 400 }
      );
    }

    // Update profile with TikTok username
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        tiktok_username,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: `TikTok account @${tiktok_username} connected successfully!`,
    });

  } catch (error) {
    console.error('Connect TikTok error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/tiktok - Disconnect TikTok account
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove TikTok username from profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        tiktok_username: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect TikTok account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'TikTok account disconnected successfully',
    });

  } catch (error) {
    console.error('Disconnect TikTok error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}