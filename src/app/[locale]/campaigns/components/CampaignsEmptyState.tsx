// src/app/[locale]/campaigns/components/CampaignsEmptyState.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, Play, Pause, Target, Video, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CampaignsEmptyStateProps {
  activeTab: string;
  hasSearch: boolean;
  locale: string;
  onCreateCampaign: () => void;
  onClearSearch: () => void;
}

export function CampaignsEmptyState({ 
  activeTab, 
  hasSearch, 
  locale, 
  onCreateCampaign, 
  onClearSearch 
}: CampaignsEmptyStateProps) {
  const t = useTranslations('Campaigns');

  const getEmptyStateContent = () => {
    if (hasSearch) {
      return {
        icon: <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />,
        title: t('empty.noResults'),
        description: t('empty.noResultsDesc'),
        action: (
          <Button onClick={onClearSearch} variant="outline">
            {t('empty.clearSearch')}
          </Button>
        )
      };
    }

    switch (activeTab) {
      case 'active':
        return {
          icon: <Play className="w-16 h-16 mx-auto text-green-400 mb-4" />,
          title: t('empty.noActive'),
          description: t('empty.noActiveDesc'),
          action: (
            <Button onClick={onCreateCampaign} className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('empty.createCampaign')}
            </Button>
          )
        };
      case 'paused':
        return {
          icon: <Pause className="w-16 h-16 mx-auto text-yellow-400 mb-4" />,
          title: t('empty.noPaused'),
          description: t('empty.noPausedDesc'),
          action: null
        };
      case 'completed':
        return {
          icon: <Target className="w-16 h-16 mx-auto text-blue-400 mb-4" />,
          title: t('empty.noCompleted'),
          description: t('empty.noCompletedDesc'),
          action: null
        };
      default:
        return {
          icon: <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />,
          title: t('empty.noCampaigns'),
          description: t('empty.noCampaignsDesc'),
          action: (
            <div className="space-y-3">
              <Button 
                onClick={onCreateCampaign} 
                className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('empty.createFirst')}
              </Button>
              <p className="text-xs text-gray-500">
                {t('empty.getInteractions')}
              </p>
            </div>
          )
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Card>
      <CardContent className="p-12 text-center">
        {content.icon}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {content.description}
        </p>
        {content.action}
      </CardContent>
    </Card>
  );
}