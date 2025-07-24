// src/lib/supabase/supabase-server.ts - Updated with middleware support
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from './supabase';

// Server-side Supabase client for Server Components and API Routes
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// For middleware - Updated to handle authentication properly
export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  return { supabase, response: supabaseResponse }
}

// Helper function to get user session from request (for API routes)
export async function getServerSession(request?: NextRequest) {
  try {
    if (request) {
      // For middleware/API routes with request object
      const { supabase } = createMiddlewareClient(request);
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } else {
      // For Server Components
      const supabase = await createServerSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    }
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
}

// Helper function to get user profile with session
export async function getServerUserProfile(request?: NextRequest) {
  try {
    const { session, error: sessionError } = await getServerSession(request);
    
    if (sessionError || !session?.user) {
      return { user: null, profile: null, error: sessionError };
    }

    const supabase = request 
      ? createMiddlewareClient(request).supabase 
      : await createServerSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return { 
      user: session.user, 
      profile, 
      error: profileError 
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { user: null, profile: null, error };
  }
}

// Helper function to require authentication in API routes
export async function requireAuth(request: NextRequest) {
  const { session, error } = await getServerSession(request);
  
  if (error || !session?.user) {
    throw new Error('Authentication required');
  }

  return { user: session.user, session };
}

// Helper function to require specific user role
export async function requireRole(request: NextRequest, requiredRole: string) {
  const { user, profile, error } = await getServerUserProfile(request);
  
  if (error || !user || !profile) {
    throw new Error('Authentication required');
  }

  if (profile.status !== requiredRole) {
    throw new Error(`${requiredRole} role required`);
  }

  return { user, profile };
}

// Helper function for API route error responses
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

// Helper function for API route success responses
export function createSuccessResponse(data?: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: NextRequest,
  requiredFields: (keyof T)[]
): Promise<T> {
  try {
    const body = await request.json();
    
    // Check required fields
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`${String(field)} is required`);
      }
    }
    
    return body as T;
  } catch (error) {
    throw new Error('Invalid request body');
  }
}

// Helper function to handle database errors
export function handleDatabaseError(error: any) {
  console.error('Database error:', error);
  
  // Handle specific Supabase errors
  if (error.code === 'PGRST116') {
    return 'Record not found';
  }
  
  if (error.code === '23505') {
    return 'Duplicate entry';
  }
  
  if (error.code === '23503') {
    return 'Referenced record not found';
  }
  
  return 'Database operation failed';
}