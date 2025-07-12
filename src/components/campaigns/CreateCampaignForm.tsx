// src/components/campaigns/CreateCampaignForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Heart, MessageCircle, UserPlus, ExternalLink, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { CampaignFormData } from '@/app/[locale]/campaigns/new/CreateCampaignClient';

interface CreateCampaignFormProps {
  formData: CampaignFormData;
  onChange: (field: keyof CampaignFormData, value: any) => void;
  onPreview: () => void;
  creditValues: Record<string, number>;
  loading: boolean;
  t: (key: string) => string;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'dance', label: 'Dance' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'beauty', label: 'Beauty & Fashion' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'pets', label: 'Pets & Animals' },
  { value: 'music', label: 'Music' },
  { value: 'education', label: 'Education' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'tech', label: 'Technology' }
];

const interactionTypes = [
  { 
    value: 'view', 
    label: 'View', 
    icon: Eye, 
    color: 'purple',
    description: 'Users will view your video'
  },
  { 
    value: 'like', 
    label: 'Like', 
    icon: Heart, 
    color: 'red',
    description: 'Users will like your video'
  },
  { 
    value: 'comment', 
    label: 'Comment', 
    icon: MessageCircle, 
    color: 'blue',
    description: 'Users will comment on your video'
  },
  { 
    value: 'follow', 
    label: 'Follow', 
    icon: UserPlus, 
    color: 'green',
    description: 'Users will follow your account'
  }
];

export default function CreateCampaignForm({
  formData,
  onChange,
  onPreview,
  creditValues,
  loading,
  t
}: CreateCampaignFormProps) {
  const [videoPreview, setVideoPreview] = useState<{
    thumbnail?: string;
    title?: string;
    valid: boolean;
  }>({ valid: false });

  // Extract TikTok video info when URL changes
  useEffect(() => {
    const extractVideoInfo = async () => {
      if (!formData.video_url) {
        setVideoPreview({ valid: false });
        return;
      }

      // Basic TikTok URL validation
      const tiktokPattern = /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/;
      if (tiktokPattern.test(formData.video_url)) {
        setVideoPreview({ valid: true });
        
        // Auto-fill title if empty
        if (!formData.video_title) {
          const username = formData.video_url.match(/@([^\/]+)/)?.[1];
          if (username) {
            onChange('video_title', `Video by @${username}`);
          }
        }
      } else {
        setVideoPreview({ valid: false });
      }
    };

    const timeoutId = setTimeout(extractVideoInfo, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.video_url]);

  const getInteractionColor = (type: string) => {
    const colorMap = {
      view: 'bg-purple-100 text-purple-700 border-purple-200',
      like: 'bg-red-100 text-red-700 border-red-200',
      comment: 'bg-blue-100 text-blue-700 border-blue-200',
      follow: 'bg-green-100 text-green-700 border-green-200'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const totalCost = formData.target_count * formData.credits_per_action;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-[#FE2C55]" />
          <span>{t('form.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video URL */}
        <div className="space-y-2">
          <Label htmlFor="video_url" className="text-sm font-medium">
            {t('form.videoUrl')} *
          </Label>
          <div className="relative">
            <Input
              id="video_url"
              type="url"
              placeholder="https://tiktok.com/@username/video/1234567890"
              value={formData.video_url}
              onChange={(e) => onChange('video_url', e.target.value)}
              className={`pr-10 ${videoPreview.valid ? 'border-green-500' : formData.video_url && !videoPreview.valid ? 'border-red-500' : ''}`}
            />
            {formData.video_url && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {videoPreview.valid ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {t('form.videoUrlHelp')}
          </p>
          {formData.video_url && videoPreview.valid && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <ExternalLink className="w-4 h-4" />
              <span>Valid TikTok URL detected</span>
            </div>
          )}
        </div>

        {/* Video Title */}
        <div className="space-y-2">
          <Label htmlFor="video_title" className="text-sm font-medium">
            {t('form.videoTitle')} *
          </Label>
          <Input
            id="video_title"
            placeholder="Enter an engaging title for your video"
            value={formData.video_title}
            onChange={(e) => onChange('video_title', e.target.value)}
            maxLength={100}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t('form.videoTitleHelp')}</span>
            <span>{formData.video_title.length}/100</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('form.description')}
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your video content (optional)"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t('form.descriptionHelp')}</span>
            <span>{formData.description.length}/500</span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('form.category')}</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interaction Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('form.interactionType')} *</Label>
          <div className="grid grid-cols-2 gap-3">
            {interactionTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.interaction_type === type.value;
              const credits = creditValues[type.value] || 1;
              
              return (
                <div
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[#FE2C55] bg-[#FE2C55]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onChange('interaction_type', type.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FE2C55]' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isSelected ? 'text-[#FE2C55]' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={isSelected ? 'border-[#FE2C55] text-[#FE2C55]' : ''}
                    >
                      {credits} credits
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Count */}
        <div className="space-y-2">
          <Label htmlFor="target_count" className="text-sm font-medium">
            {t('form.targetCount')} *
          </Label>
          <div className="flex items-center space-x-4">
            <Input
              id="target_count"
              type="number"
              min="1"
              max="1000"
              value={formData.target_count}
              onChange={(e) => onChange('target_count', parseInt(e.target.value) || 1)}
              className="flex-1"
            />
            <div className="flex space-x-2">
              {[10, 25, 50, 100].map((count) => (
                <Button
                  key={count}
                  variant={formData.target_count === count ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange('target_count', count)}
                  type="button"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {t('form.targetCountHelp')}
          </p>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.target_count} × {formData.credits_per_action} credits
            </span>
            <span className="font-semibold text-lg">
              {totalCost.toLocaleString()} credits
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {t('form.costHelp')}
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPreview}
            disabled={loading || !formData.video_url || !formData.video_title}
            className="flex-1"
          >
            {t('form.preview')}
          </Button>
          <Button
            type="button"
            onClick={onPreview}
            disabled={loading || !formData.video_url || !formData.video_title}
            className="flex-1 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
          >
            {t('form.createCampaign')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}