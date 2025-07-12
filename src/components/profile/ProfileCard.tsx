// src/components/profile/ProfileCard.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Camera,
  Copy,
  Check,
  Coins,
  ExternalLink,
  Edit,
  X,
  CheckCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Profile } from '@/contexts/auth-context';
import type { TikTokStats } from '@/types/profile';

interface ProfileCardProps {
  profile: Profile;
  tiktokStats: TikTokStats | null;
  isEditing: boolean;
  onEditToggle: () => void;
  onTikTokConnect: () => void;
  formatDate: (date: string) => string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  tiktokStats,
  isEditing,
  onEditToggle,
  onTikTokConnect,
  formatDate
}) => {
  const t = useTranslations('Profile');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-fit">
        <CardHeader className="text-center">
          <div className="relative mx-auto">
            <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
              <AvatarImage 
                src={profile.avatar_url} 
                alt={profile.email || 'User'} 
              />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white">
                {profile.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile.email}
            </h3>
            
            {profile.tiktok_username ? (
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="bg-[#FE2C55]/10 text-[#FE2C55] border-[#FE2C55]/20">
                  @{profile.tiktok_username}
                </Badge>
                {tiktokStats?.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
            ) : (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                {t('tiktokNotConnected')}
              </Badge>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('memberSince')} {formatDate(profile.created_at)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.email')}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{profile.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(profile.email, 'email')}
                  className="h-6 w-6 p-0"
                >
                  {copiedText === 'email' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                <Coins className="w-3 h-3 mr-1" />
                {profile.credits || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                {profile.status || 'active'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            {!profile.tiktok_username ? (
              <Button
                onClick={onTikTokConnect}
                className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('actions.connectTiktok')}
              </Button>
            ) : (
              <Button
                onClick={() => window.open(`https://tiktok.com/@${profile.tiktok_username}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('actions.viewTiktokProfile')}
              </Button>
            )}

            <Button
              onClick={onEditToggle}
              variant="outline"
              className="w-full"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  {t('actions.cancel')}
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('actions.editProfile')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;