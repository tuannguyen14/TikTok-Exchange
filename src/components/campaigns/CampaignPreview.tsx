// src/components/campaigns/CampaignPreview.tsx
import React from 'react';
import { 
  CheckCircle, 
  Edit, 
  Eye, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  ExternalLink,
  Loader2,
  Clock,
  Target,
  Coins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CampaignFormData } from '@/app/[locale]/campaigns/new/CreateCampaignClient';
import type { Profile } from '@/types/auth';

interface CampaignPreviewProps {
  formData: CampaignFormData;
  profile: Profile;
  totalCost: number;
  onEdit: () => void;
  onConfirm: () => void;
  loading: boolean;
  t: (key: string) => string;
}

export default function CampaignPreview({
  formData,
  profile,
  totalCost,
  onEdit,
  onConfirm,
  loading,
  t
}: CampaignPreviewProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'view': return <Eye className="w-5 h-5 text-purple-500" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const getInteractionColor = (type: string) => {
    const colorMap = {
      view: 'bg-purple-100 text-purple-700 border-purple-200',
      like: 'bg-red-100 text-red-700 border-red-200',
      comment: 'bg-blue-100 text-blue-700 border-blue-200',
      follow: 'bg-green-100 text-green-700 border-green-200'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const estimatedDuration = Math.ceil(formData.target_count / 10); // Rough estimate

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                {t('preview.title')}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('preview.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getActionIcon(formData.interaction_type)}
              <span>{t('preview.campaignDetails')}</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={loading}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('preview.edit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('preview.videoDetails')}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Title:</span>
                  <p className="font-medium">{formData.video_title}</p>
                </div>
                
                {formData.description && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {formData.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(formData.video_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Video
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Campaign Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('preview.campaignSettings')}
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Interaction Type:</span>
                  <Badge 
                    variant="outline" 
                    className={getInteractionColor(formData.interaction_type)}
                  >
                    {getActionIcon(formData.interaction_type)}
                    <span className="ml-1 capitalize">{formData.interaction_type}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target Count:</span>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{formData.target_count.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits per Action:</span>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{formData.credits_per_action}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Duration:</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{estimatedDuration} days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('preview.costBreakdown')}
              </h4>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Credits:</span>
                  <span className="font-medium">{profile.credits.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Campaign Cost:</span>
                  <span className="font-medium text-red-600">-{totalCost.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="font-medium">Remaining Credits:</span>
                  <span className="font-bold text-green-600">
                    {(profile.credits - totalCost).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  <p>• {formData.target_count} × {formData.credits_per_action} = {totalCost} credits</p>
                  <p>• Estimated completion: {estimatedDuration} days</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* What Happens Next */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('preview.whatHappensNext')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Campaign Goes Live
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your campaign appears in the exchange hub
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Users Interact
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Other users perform actions on your video
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Track Progress
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Monitor your campaign in the dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onEdit}
              disabled={loading}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('preview.editCampaign')}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading || totalCost > profile.credits}
              className="flex-1 bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('preview.creating')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('preview.confirmAndCreate')}
                </>
              )}
            </Button>
          </div>
          
          {totalCost > profile.credits && (
            <p className="text-sm text-red-600 text-center">
              {t('preview.insufficientCredits')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}