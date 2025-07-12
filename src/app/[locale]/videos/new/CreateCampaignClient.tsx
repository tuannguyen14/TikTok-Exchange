// src/app/[locale]/videos/new/CreateCampaignClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CreateCampaignForm from '@/components/campaigns/CreateCampaignForm';
import CampaignPreview from '@/components/campaigns/CampaignPreview';
import type { Profile, User } from '@/types/auth';
import type { CreateCampaignRequest } from '@/types/campaign';
import { campaignAPI } from '@/lib/api/campaigns';

interface CreateCampaignClientProps {
  locale: string;
  profile: Profile;
  creditValues: Record<string, number>;
}

export interface CampaignFormData {
  video_url: string;
  video_title: string;
  description: string;
  category: string;
  interaction_type: 'like' | 'comment' | 'follow' | 'view';
  target_count: number;
  credits_per_action: number;
}

export default function CreateCampaignClient({ 
  locale, 
  profile, 
  creditValues 
}: CreateCampaignClientProps) {
  const router = useRouter();
  const t = useTranslations('Videos');
  
  const [formData, setFormData] = useState<CampaignFormData>({
    video_url: '',
    video_title: '',
    description: '',
    category: 'general',
    interaction_type: 'like',
    target_count: 10,
    credits_per_action: creditValues.like || 2
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFormChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update credits when interaction type changes
      if (field === 'interaction_type') {
        updated.credits_per_action = creditValues[value] || 1;
      }
      
      return updated;
    });
    
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.video_url.trim()) {
      return t('form.errors.videoUrlRequired');
    }
    
    if (!formData.video_title.trim()) {
      return t('form.errors.videoTitleRequired');
    }
    
    if (formData.target_count < 1 || formData.target_count > 1000) {
      return t('form.errors.invalidTargetCount');
    }

    // Validate TikTok URL format
    const tiktokUrlPattern = /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/;
    if (!tiktokUrlPattern.test(formData.video_url)) {
      return t('form.errors.invalidTikTokUrl');
    }

    const totalCost = formData.target_count * formData.credits_per_action;
    if (totalCost > profile.credits) {
      return t('form.errors.insufficientCredits')
        .replace('{cost}', totalCost.toString())
        .replace('{available}', profile.credits.toString());
    }

    return null;
  };

  const calculateTotalCost = () => {
    return formData.target_count * formData.credits_per_action;
  };

  const handlePreview = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const campaignData: CreateCampaignRequest = {
        video_url: formData.video_url.trim(),
        video_title: formData.video_title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        interaction_type: formData.interaction_type,
        target_count: formData.target_count,
        credits_per_action: formData.credits_per_action
      };

      const result = await campaignAPI.createCampaign(campaignData);

      if (result.success) {
        setSuccess(t('form.success.campaignCreated'));
        
        // Redirect to campaigns list after success
        setTimeout(() => {
          router.push(`/${locale}/videos`);
        }, 2000);
      } else {
        setError(result.error || t('form.errors.createFailed'));
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      setError(t('form.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      router.push(`/${locale}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{showPreview ? t('form.backToEdit') : t('form.backToDashboard')}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
                {t('createNew')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {showPreview ? t('form.previewDescription') : t('form.createDescription')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form or Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            {showPreview ? (
              <CampaignPreview
                formData={formData}
                profile={profile}
                totalCost={calculateTotalCost()}
                onEdit={() => setShowPreview(false)}
                onConfirm={handleSubmit}
                loading={loading}
                t={t}
              />
            ) : (
              <CreateCampaignForm
                formData={formData}
                onChange={handleFormChange}
                onPreview={handlePreview}
                creditValues={creditValues}
                loading={loading}
                t={t}
              />
            )}
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <CampaignSidebar
              profile={profile}
              totalCost={calculateTotalCost()}
              formData={formData}
              t={t}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
interface CampaignSidebarProps {
  profile: Profile;
  totalCost: number;
  formData: CampaignFormData;
  t: (key: string) => string;
}

function CampaignSidebar({ profile, totalCost, formData, t }: CampaignSidebarProps) {
  const remainingCredits = profile.credits - totalCost;
  const canAfford = remainingCredits >= 0;

  return (
    <>
      {/* Credits Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('form.creditsSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.currentCredits')}</span>
            <span className="font-semibold">{profile.credits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.campaignCost')}</span>
            <span className={`font-semibold ${canAfford ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
              -{totalCost.toLocaleString()}
            </span>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="flex justify-between">
            <span className="font-medium">{t('form.remaining')}</span>
            <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {remainingCredits.toLocaleString()}
            </span>
          </div>
          
          {!canAfford && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="text-sm">
                {t('form.errors.insufficientCreditsWarning')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('form.campaignDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.interactionType')}</span>
            <span className="font-medium capitalize">{formData.interaction_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.targetCount')}</span>
            <span className="font-medium">{formData.target_count.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.creditsPerAction')}</span>
            <span className="font-medium">{formData.credits_per_action}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('form.category')}</span>
            <span className="font-medium capitalize">{formData.category}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('form.tips.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>💡 {t('form.tips.tip1')}</p>
            <p>🎯 {t('form.tips.tip2')}</p>
            <p>📈 {t('form.tips.tip3')}</p>
            <p>⚡ {t('form.tips.tip4')}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}