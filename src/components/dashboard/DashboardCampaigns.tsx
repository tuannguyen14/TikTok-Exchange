// src/components/dashboard/DashboardCampaigns.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Video, 
  ArrowRight, 
  Play, 
  Pause,
  Eye,
  Heart,
  MessageCircle,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { campaignAPI } from '@/lib/api/campaigns';

interface Campaign {
  id: string;
  video_title?: string;
  interaction_type: 'like' | 'comment' | 'follow' | 'view';
  target_count: number;
  current_count: number;
  remaining_credits: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

interface DashboardCampaignsProps {
  campaigns: Campaign[];
  locale: string;
  t: (key: string) => string;
  onCampaignStatusUpdate?: (campaignId: string, status: 'active' | 'paused') => Promise<boolean>;
}

export default function DashboardCampaigns({ 
  campaigns: initialCampaigns, 
  locale, 
  t,
  onCampaignStatusUpdate
}: DashboardCampaignsProps) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-700 border-red-200';
      case 'comment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'follow': return 'bg-green-100 text-green-700 border-green-200';
      case 'view': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setUpdating(campaignId);
    setError(null);
    
    try {
      // Use the callback if provided, otherwise fallback to direct API call
      let success = false;
      
      if (onCampaignStatusUpdate) {
        success = await onCampaignStatusUpdate(campaignId, newStatus);
      } else {
        const result = await campaignAPI.updateCampaign(campaignId, newStatus);
        success = result.success;
        if (!success) {
          setError(result.error || 'Failed to update campaign');
        }
      }
      
      if (success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus as any }
            : campaign
        ));
      }
    } catch (error) {
      console.error('Update campaign error:', error);
      setError('An error occurred while updating the campaign');
    } finally {
      setUpdating(null);
    }
  };

  const refreshCampaigns = async () => {
    try {
      setUpdating('refresh');
      setError(null);

      const result = await campaignAPI.getUserCampaigns({ limit: 5 });
      
      if (result.success && result.data) {
        setCampaigns(result.data.campaigns || []);
      } else {
        setError(result.error || 'Failed to refresh campaigns');
      }
    } catch (error) {
      console.error('Refresh campaigns error:', error);
      setError('An error occurred while refreshing campaigns');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-[#FE2C55]" />
          <span>{t('campaigns.title')}</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshCampaigns}
            disabled={updating === 'refresh'}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${updating === 'refresh' ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/${locale}/campaigns`)}
          >
            {t('campaigns.viewAll')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {campaigns.length > 0 ? (
          campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {campaign.video_title || 'Untitled Video'}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge 
                      variant="outline" 
                      className={getInteractionColor(campaign.interaction_type)}
                    >
                      {getActionIcon(campaign.interaction_type)}
                      <span className="ml-1 capitalize">{campaign.interaction_type}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {campaign.current_count}/{campaign.target_count}
                    </span>
                  </div>
                  <Progress 
                    value={(campaign.current_count / campaign.target_count) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={campaign.status === 'active' ? 'default' : 'secondary'}
                  className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                >
                  {t(`campaigns.status.${campaign.status}`)}
                </Badge>
                
                {campaign.status !== 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                    disabled={updating === campaign.id}
                    title={campaign.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                  >
                    {updating === campaign.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : campaign.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('campaigns.noCampaigns')}</p>
            <Button 
              variant="link" 
              onClick={() => router.push(`/${locale}/campaigns/new`)}
              className="text-[#FE2C55] hover:text-[#FF4081] mt-2"
            >
              {t('campaigns.createFirst')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}