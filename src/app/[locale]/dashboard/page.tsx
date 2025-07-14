// src/app/[locale]/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardClient from './DashboardClient';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import TikTokLinkPrompt from '@/components/dashboard/TikTokLinkPrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import OverlayLoading from "@/components/loading/OverlayLoading";

export default function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState<string>('');
  const router = useRouter();

  // Use auth context
  const {
    isAuthenticated,
    loading: authLoading,
    profile,
    user,
    error: authError
  } = useAuth();

  // Use dashboard hook
  const {
    campaigns,
    stats,
    loading: dashboardLoading,
    error: dashboardError,
    refreshing,
    refreshDashboardData,
    updateCampaignStatus
  } = useDashboard();

  // Resolve params
  useEffect(() => {
    params.then(({ locale }) => {
      setLocale(locale);
    });
  }, [params]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale || 'vi'}/auth/login`);
    }
  }, [authLoading, isAuthenticated, router, locale]);

  const handleRetry = () => {
    refreshDashboardData();
  };

  // Show loading while auth is loading or locale is not resolved
  if (authLoading || !locale) {
    return <>
      <OverlayLoading
        isVisible={authLoading} />
      <DashboardSkeleton />
    </>;
  }

  // Show auth error if any
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Authentication error: {authError}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push(`/${locale}/auth/login`)}
            className="w-full mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (this should be handled by middleware, but just in case)
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Show error if profile/user not loaded
  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load user profile. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="w-full mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show TikTok link prompt if not connected
  if (!profile.tiktok_username) {
    return <TikTokLinkPrompt locale={locale} />;
  }

  // Show loading skeleton while fetching data
  if (dashboardLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry option
  if (dashboardError && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dashboardError}</AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              className="w-full mt-4"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show dashboard with data
  return (
    <DashboardClient
      locale={locale}
      profile={profile}
      campaigns={campaigns}
      stats={stats || {
        totalCredits: profile.credits || 0,
        totalEarned: profile.total_earned || 0,
        totalSpent: profile.total_spent || 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalActionsReceived: 0,
      }}
      refreshing={refreshing}
      onRefresh={refreshDashboardData}
      onCampaignStatusUpdate={updateCampaignStatus}
    />
  );
}