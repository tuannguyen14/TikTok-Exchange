// src/app/[locale]/campaigns/components/CampaignsHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Video, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignsHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  onCreateCampaign: () => void;
}

export function CampaignsHeader({ 
  refreshing, 
  onRefresh, 
  onCreateCampaign 
}: CampaignsHeaderProps) {
  const t = useTranslations('Campaigns');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-lg flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
        <Button
          onClick={onCreateCampaign}
          className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('newCampaign')}
        </Button>
      </div>
    </motion.div>
  );
}