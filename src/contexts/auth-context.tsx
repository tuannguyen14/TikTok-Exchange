'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { normalizeError, getUserFriendlyErrorMessage, logError, retryAsync } from '@/lib/utils/errors';
import { createClient } from '@/lib/supabase/supabase';
import type { User, AuthState, Profile, ApiResponse } from '@/types/auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: string | null; success: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; success: boolean }>;
  signOut: () => Promise<{ error: string | null; success: boolean }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null; success: boolean }>;
  refreshProfile: () => Promise<{ error: string | null; success: boolean }>;
  connectTikTok: (tiktokUsername: string) => Promise<{ error: string | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null; success: boolean }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null; success: boolean }>;
  checkSession: () => Promise<void>;
  realtimeCredits: number; // Realtime credits value
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
        credentials: 'include', // Important for cookies
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    }, 2, 1000); // Retry up to 2 times with 1s delay

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

  // Sign up method (simplified - no username required)
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
        // After successful signup, check session to get user data
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

      const { data, error, success } = await apiCall<{ user: User; profile: Profile }>('/api/auth/login', {
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
        // Set up realtime credits
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

      // Always clear local state and realtime subscription, even if API call fails
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

  // Update profile method
  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated', success: false };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error, success } = await apiCall<Profile>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (success && data) {
        setState(prev => ({
          ...prev,
          profile: data,
          loading: false,
          error: null,
        }));
        // Update realtime credits if changed
        if (data.credits !== undefined) {
          setRealtimeCredits(data.credits);
        }
        return { error: null, success: true };
      } else {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error: error || 'Profile update failed', success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: errorMessage, success: false };
    }
  };

  // Refresh profile method
  const refreshProfile = async (): Promise<{ error: string | null; success: boolean }> => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated', success: false };
      }

      const { data, error, success } = await apiCall<Profile>('/api/user/profile');

      if (success && data) {
        setState(prev => ({
          ...prev,
          profile: data,
          error: null,
        }));
        // Update realtime credits
        if (data.credits !== undefined) {
          setRealtimeCredits(data.credits);
        }
        return { error: null, success: true };
      } else {
        return { error: error || 'Profile refresh failed', success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile refresh failed';
      return { error: errorMessage, success: false };
    }
  };

  // Connect TikTok method
  const connectTikTok = async (
    tiktokUsername: string
  ): Promise<{ error: string | null; success: boolean }> => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated', success: false };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error, success } = await apiCall<Profile>('/api/user/tiktok', {
        method: 'POST',
        body: JSON.stringify({ tiktok_username: tiktokUsername }),
      });

      if (success && data) {
        setState(prev => ({
          ...prev,
          profile: data,
          loading: false,
          error: null,
        }));
        return { error: null, success: true };
      } else {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error: error || 'TikTok connection failed', success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'TikTok connection failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
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
    updateProfile,
    refreshProfile,
    connectTikTok,
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

// Utility hook for auth status
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
}

// Utility hook for user profile only (updated for email)
export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  return { profile, refreshProfile };
}

// Utility hook for credits only (updated to use realtime credits)
export function useUserCredits() {
  const { profile, refreshProfile, realtimeCredits } = useAuth();
  return {
    credits: realtimeCredits, // Use realtime credits instead of profile.credits
    totalEarned: profile?.total_earned || 0,
    totalSpent: profile?.total_spent || 0,
    refreshCredits: refreshProfile,
  };
}