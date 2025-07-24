// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

export async function GET(request: NextRequest) {
  try {
    
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No authenticated user' },
        { status: 401 }
      );
    }
    console.log("user.id", user.id)
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log("profile", profile)

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        profile,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}