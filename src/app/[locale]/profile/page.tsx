// src/app/[locale]/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { campaignAPI } from '@/lib/api/campaigns';
import { profileAPI } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import ProfileCard from '@/components/profile/ProfileCard';
import TikTokConnectModal from '@/components/profile/TikTokConnectModal';
import ProfileOverviewTab from '@/components/profile/ProfileOverviewTab';
import ProfileSettingsTab from '@/components/profile/ProfileSettingsTab';
import ProfileStatsTab from '@/components/profile/ProfileStatsTab';
import ProfileHistoryTab from '@/components/profile/ProfileHistoryTab';

import type { ProfileStats, TikTokStats } from '@/types/profile';

import OverlayLoading from "@/components/ui/loading/loading-overlay";

const ProfilePage: React.FC = () => {
  const { profile, loading: authLoading, updateProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('Profile');

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [tiktokStats, setTikTokStats] = useState<TikTokStats | null>(null);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for action parameter (from dashboard redirect)
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'link-tiktok') {
      setShowTikTokModal(true);
    }
  }, [searchParams]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profile) return;

      try {
        setDataLoading(true);
        setError(null);

        // Fetch user campaign stats
        const [statsResult, actionsResult] = await Promise.all([
          campaignAPI.getUserCampaignStats(),
          campaignAPI.getUserActions({ limit: 1 })
        ]);

        if (statsResult.success && statsResult.data) {
          const stats: ProfileStats = {
            totalCampaigns: statsResult.data.overview.totalCampaigns,
            activeCampaigns: statsResult.data.overview.activeCampaigns,
            completedCampaigns: statsResult.data.overview.completedCampaigns,
            totalCreditsEarned: profile.total_earned,
            totalCreditsSpent: profile.total_spent,
            totalActionsPerformed: actionsResult.success && actionsResult.data?.stats
              ? actionsResult.data.stats.totalActions
              : 0,
            totalActionsReceived: statsResult.data.overview.totalActionsReceived,
            joinDate: profile.created_at
          };
          setProfileStats(stats);
        }

        // Fetch TikTok stats if username exists
        if (profile.tiktok_username) {
          await fetchTikTokStats(profile.tiktok_username);
        }

      } catch (error) {
        console.error('Profile data fetch error:', error);
        setError(t('alerts.errorLoading'));
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileData();
  }, [profile, t]);

  const fetchTikTokStats = async (username: string) => {
    try {
      const result = await profileAPI.fetchTikTokStats(username);

      if (result.success && result.data) {
        setTikTokStats({
          followers: result.data.stats?.followerCount || 0,
          following: result.data.stats?.followingCount || 0,
          likes: result.data.stats?.heartCount || 0,
          videos: result.data.stats?.videoCount || 0,
          verified: result.data.user?.verified || false
        });
      }
    } catch (error) {
      console.error('TikTok stats fetch error:', error);
    }
  };

  const handleTikTokConnect = async (username: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await profileAPI.connectTikTok(username);

      if (result.success) {
        setSuccess(t('alerts.tiktokConnected'));
        await refreshProfile();
        await fetchTikTokStats(username);

        // Redirect to dashboard if came from dashboard
        if (searchParams?.get('action') === 'link-tiktok') {
          setTimeout(() => {
            router.push(`/${locale}/dashboard`);
          }, 2000);
        }

        return { success: true };
      } else {
        return { success: false, error: result.error || t('alerts.errorConnecting') };
      }
    } catch (error) {
      return { success: false, error: t('alerts.errorConnecting') };
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateProfile(updates);

      if (result.success) {
        setSuccess(t('alerts.profileUpdated'));
        setIsEditing(false);
        await refreshProfile();
        return { success: true };
      } else {
        setError(result.error || t('alerts.errorUpdating'));
        return { success: false, error: result.error ?? undefined };
      }
    } catch (error) {
      const errorMsg = t('alerts.errorUpdating');
      setError(errorMsg);
      return { success: false, error: errorMsg ?? undefined };
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <OverlayLoading
          isVisible={authLoading || dataLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('description')}
            </p>
          </div>

          <Button
            onClick={() => router.push(`/${locale}/dashboard`)}
            variant="outline"
            className="border-[#FE2C55] text-[#FE2C55] hover:bg-[#FE2C55] hover:text-white"
          >
            {t('backToDashboard')}
          </Button>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <ProfileCard
            profile={profile}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onTikTokConnect={() => setShowTikTokModal(true)}
            formatDate={formatDate}
          />

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
                <TabsTrigger value="stats">{t('tabs.stats')}</TabsTrigger>
                <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
                <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ProfileOverviewTab
                  profile={profile}
                  profileStats={profileStats}
                  tiktokStats={tiktokStats}
                />
              </TabsContent>

              <TabsContent value="stats">
                <ProfileStatsTab
                  profile={profile}
                  profileStats={profileStats}
                />
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettingsTab
                  profile={profile}
                  isEditing={isEditing}
                  loading={loading}
                  onProfileUpdate={handleProfileUpdate}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  onTikTokConnect={() => setShowTikTokModal(true)}
                  onClearMessages={clearMessages}
                />
              </TabsContent>

              <TabsContent value="history">
                <ProfileHistoryTab
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* TikTok Connection Modal */}
        <TikTokConnectModal
          isOpen={showTikTokModal}
          onClose={() => setShowTikTokModal(false)}
          onConnect={handleTikTokConnect}
          profile={profile}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProfilePage;