// src/components/profile/TikTokConnectModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LinkIcon,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { profileAPI } from '@/lib/api/profile';
import type { Profile } from '@/contexts/auth-context';
import type { TikTokPreview } from '@/types/profile';

interface TikTokConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (username: string, preview?: TikTokPreview | null) => Promise<{ success: boolean; error?: string }>;
  profile?: Profile;
  loading: boolean;
}

const TikTokConnectModal: React.FC<TikTokConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  profile,
  loading
}) => {
  const t = useTranslations('Profile');
  const [username, setUsername] = useState(profile?.tiktok_username || '');
  const [tiktokPreview, setTikTokPreview] = useState<TikTokPreview | null>(null);
  const [verifyingTikTok, setVerifyingTikTok] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUsername(profile?.tiktok_username || '');
      setTikTokPreview(null);
      setError(null);
    } else {
      setTikTokPreview(null);
      setError(null);
    }
  }, [isOpen, profile]);

  // Debounced TikTok verification - chỉ verify khi user nhập xong
  useEffect(() => {
    if (!username.trim()) {
      setTikTokPreview(null);
      setError(null);
      return;
    }

    // Chỉ verify khi username có ít nhất 3 ký tự và không có dấu cách
    if (username.trim().length < 3 || username.includes(' ')) {
      setTikTokPreview(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setVerifyingTikTok(true);
        setError(null);

        const result = await profileAPI.verifyTikTokUsername(username.trim());

        if (result.success && result.data) {
          setTikTokPreview(result.data);
          setError(null);
        } else {
          setTikTokPreview(null);
          setError(result.error || t('alerts.errorVerifying'));
        }
      } catch (error) {
        console.error('TikTok verification error:', error);
        setTikTokPreview(null);
        setError(t('alerts.errorVerifying'));
      } finally {
        setVerifyingTikTok(false);
      }
    }, 1000); // Tăng thời gian debounce lên 1 giây để tránh spam

    return () => clearTimeout(timeoutId);
  }, [username, t]);

  const handleConnect = async () => {
    if (!username.trim()) {
      setError(t('alerts.enterUsername'));
      return;
    }

    // Yêu cầu user phải verify trước khi connect (trừ khi đang update)
    if (!profile?.tiktok_username && !tiktokPreview) {
      setError('Please wait for username verification before connecting');
      return;
    }

    const result = await onConnect(username.trim(), tiktokPreview);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || t('alerts.errorConnecting'));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {profile?.tiktok_username ? t('tiktokForm.updateTitle') : t('tiktokForm.connectTitle')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <Label htmlFor="tiktok_username">{t('tiktokForm.username')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <Input
                  id="tiktok_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('tiktokForm.usernamePlaceholder')}
                  className="pl-8"
                  autoFocus
                  disabled={loading}
                />
                {verifyingTikTok && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('tiktokForm.usernameHelp')}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* TikTok Profile Preview */}
            {tiktokPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={tiktokPreview.avatar}
                    alt={tiktokPreview.nickname}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {tiktokPreview.nickname}
                      </h4>
                      {tiktokPreview.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{tiktokPreview.username}
                    </p>
                    {tiktokPreview.signature && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {tiktokPreview.signature}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tiktokPreview.stats.followers.toLocaleString()}
                    </p>
                    <p className="text-gray-500">{t('overview.followers')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tiktokPreview.stats.following.toLocaleString()}
                    </p>
                    <p className="text-gray-500">{t('overview.following')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tiktokPreview.stats.likes.toLocaleString()}
                    </p>
                    <p className="text-gray-500">{t('overview.likes')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tiktokPreview.stats.videos.toLocaleString()}
                    </p>
                    <p className="text-gray-500">{t('overview.videos')}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-green-700 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Profile verified and ready to connect</span>
                </div>
              </motion.div>
            )}

            {/* Security Note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {t('tiktokForm.securityNote')}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleConnect}
                disabled={
                  loading || 
                  !username.trim() || 
                  verifyingTikTok ||
                  (!tiktokPreview && !profile?.tiktok_username)
                }
                className="flex-1 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                {profile?.tiktok_username ? t('tiktokForm.update') : t('tiktokForm.connect')}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={loading}
              >
                {t('tiktokForm.cancel')}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TikTokConnectModal;