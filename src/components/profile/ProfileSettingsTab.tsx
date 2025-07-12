// src/components/profile/ProfileSettingsTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Save, 
  ExternalLink, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Profile } from '@/types/auth';

interface ProfileFormData {
  email: string;
}

interface ProfileSettingsTabProps {
  profile: Profile;
  isEditing: boolean;
  loading: boolean;
  onProfileUpdate: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  onEditToggle: () => void;
  onTikTokConnect: () => void;
  onClearMessages: () => void;
}

const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  profile,
  isEditing,
  loading,
  onProfileUpdate,
  onEditToggle,
  onTikTokConnect,
  onClearMessages
}) => {
  const t = useTranslations('Profile');
  const [formData, setFormData] = useState<ProfileFormData>({
    email: profile.email || ''
  });

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      email: profile.email || ''
    });
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onClearMessages();
  };

  const handleSave = async () => {
    const updates: Partial<Profile> = {};

    // Check what changed (only email now since avatar_url is removed)
    if (formData.email !== profile.email) {
      updates.email = formData.email;
    }

    if (Object.keys(updates).length > 0) {
      await onProfileUpdate(updates);
    } else {
      onEditToggle();
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profile.email || ''
    });
    onEditToggle();
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50 dark:bg-gray-800' : ''}
              />
            </div>

            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('settings.saveChanges')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={loading}
                >
                  {t('settings.cancel')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TikTok Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-[#FE2C55]" />
            <span>{t('settings.tiktokIntegration')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.tiktok_username ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('settings.tiktokConnected', { username: profile.tiktok_username })}
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={onTikTokConnect}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('settings.changeTiktokUsername')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('settings.tiktokNotConnectedDesc')}
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={onTikTokConnect}
                className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('settings.connectTiktok')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettingsTab;