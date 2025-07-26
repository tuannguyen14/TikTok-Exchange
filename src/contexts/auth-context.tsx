'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { normalizeError, getUserFriendlyErrorMessage, logError, retryAsync } from '@/lib/utils/errors';
import { createClient } from '@/lib/supabase/supabase';
import type { User, AuthState, ApiResponse } from '@/types/auth';
import type { Profile } from '@/types/profile';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: string | null; success: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; success: boolean }>;
  signOut: () => Promise<{ error: string | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null; success: boolean }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null; success: boolean }>;
  checkSession: () => Promise<void>;
  realtimeCredits: number;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API utility functions with better error handling
const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; success: boolean }> => {
  try {
    const response = await retryAsync(async () => {
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    }, 2, 1000);

    const result: ApiResponse<T> = await response.json();

    return {
      data: result.data || null,
      error: result.success ? null : (result.error || result.message || 'Unknown error'),
      success: result.success
    };
  } catch (error) {
    const normalizedError = normalizeError(error);
    const userFriendlyMessage = getUserFriendlyErrorMessage(normalizedError);

    logError(error, `API call to ${endpoint}`);

    return {
      data: null,
      error: userFriendlyMessage,
      success: false
    };
  }
};

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });
  const [realtimeCredits, setRealtimeCredits] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Set up realtime subscription for credits
  const setupRealtimeCredits = useCallback((userId: string, initialCredits: number) => {
    // Clean up existing subscription
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Set initial credits
    setRealtimeCredits(initialCredits);

    // Create new subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`credits:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('Credits updated via realtime:', payload);
          if (payload.new && 'credits' in payload.new) {
            setRealtimeCredits(payload.new.credits);
            // Also update the profile in state
            setState(prev => ({
              ...prev,
              profile: prev.profile ? { ...prev.profile, credits: payload.new.credits } : null
            }));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, []);

  // Clean up realtime subscription
  const cleanupRealtimeCredits = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Check session from API
  const checkSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error, success } = await apiCall<{ user: User; profile: Profile }>('/api/auth/session');

      if (success && data) {
        setState({
          user: data.user,
          profile: data.profile,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        // Set up realtime credits
        setupRealtimeCredits(data.user.id, data.profile.credits || 0);
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: error,
          isAuthenticated: false,
        });
        cleanupRealtimeCredits();
      }
    } catch (error) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Session check failed',
        isAuthenticated: false,
      });
      cleanupRealtimeCredits();
    }
  }, [setupRealtimeCredits, cleanupRealtimeCredits]);

  // Initialize auth state
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRealtimeCredits();
    };
  }, [cleanupRealtimeCredits]);

  // Sign up method
  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error, success } = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (success) {
        await checkSession();
        return { error: null, success: true };
      } else {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error: error || 'Sign up failed', success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: errorMessage, success: false };
    }
  };

  // Sign in method
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error, success } = await apiCall<{ user: User; profile: Profile }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (success && data) {
        setState({
          user: data.user,
          profile: data.profile,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        setupRealtimeCredits(data.user.id, data.profile.credits || 0);
        return { error: null, success: true };
      } else {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error: error || 'Sign in failed', success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: errorMessage, success: false };
    }
  };

  // Sign out method
  const signOut = async (): Promise<{ error: string | null; success: boolean }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error, success } = await apiCall('/api/auth/logout', {
        method: 'POST',
      });

      cleanupRealtimeCredits();
      setState({
        user: null,
        profile: null,
        loading: false,
        error: success ? null : error,
        isAuthenticated: false,
      });
      setRealtimeCredits(0);

      return { error: success ? null : error, success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      cleanupRealtimeCredits();
      setState({
        user: null,
        profile: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      setRealtimeCredits(0);
      return { error: errorMessage, success: false };
    }
  };

  // Reset password method
  const resetPassword = async (
    email: string
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      const { error, success } = await apiCall('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return { error: success ? null : (error || 'Reset password failed'), success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reset password failed';
      return { error: errorMessage, success: false };
    }
  };

  // Change password method
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated', success: false };
      }

      const { error, success } = await apiCall('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      return { error: success ? null : (error || 'Password change failed'), success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      return { error: errorMessage, success: false };
    }
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    changePassword,
    checkSession,
    realtimeCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Utility hooks with renamed functions to avoid conflicts

// Basic auth profile getter
export function useAuthProfile() {
  const { profile } = useAuth();
  return { profile };
}

// Auth status only
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
}

// Credits with realtime updates
export function useAuthCredits() {
  const { profile, realtimeCredits, checkSession } = useAuth();
  return {
    credits: realtimeCredits,
    totalEarned: profile?.total_earned || 0,
    totalSpent: profile?.total_spent || 0,
    refreshCredits: checkSession,
  };
}