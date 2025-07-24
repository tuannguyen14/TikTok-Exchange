// src/hooks/useAuth.tsx
import { useAuth as useAuthContext } from '@/contexts/auth-context';

// Re-export cho convenience
export const useAuth = useAuthContext;

// Specialized hooks for specific use cases
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuthContext();
  return { isAuthenticated, loading };
}

export function useProfile() {
  const { profile, refreshProfile, updateProfile } = useAuthContext();
  return { profile, refreshProfile, updateProfile };
}

export function useUserCredits() {
  const { profile, refreshProfile } = useAuthContext();
  return {
    credits: profile?.credits || 0,
    totalEarned: profile?.total_earned || 0,
    totalSpent: profile?.total_spent || 0,
    refreshCredits: refreshProfile,
  };
}

export function useAuthActions() {
  const { signIn, signUp, signOut, resetPassword, changePassword } = useAuthContext();
  return { signIn, signUp, signOut, resetPassword, changePassword };
}

// Hook for conditional rendering based on auth state
export function useAuthGuard() {
  const { isAuthenticated, loading, user } = useAuthContext();
  
  return {
    isAuthenticated,
    loading,
    isGuest: !isAuthenticated && !loading,
    userId: user?.id,
    userEmail: user?.email,
  };
}