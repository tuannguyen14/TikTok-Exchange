// 7. Campaign Review Component: src/app/[locale]/campaigns/create/components/CampaignReview.tsx
'use client';

import { motion } from 'framer-motion';
import { VideoCameraIcon, UserPlusIcon, HeartIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface CampaignReviewProps {
  campaignType: 'video' | 'follow';
  formData: any;
  verifiedVideoData: any;
  userProfile: any;
  totalCost: number;
  translations: any;
}

export default function CampaignReview({
  campaignType,
  formData,
  verifiedVideoData,
  userProfile,
  totalCost,
  translations
}: CampaignReviewProps) {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <HeartIcon className="w-5 h-5 text-[#FE2C55]" />;
      case 'view':
        return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Campaign
        </h2>
        <p className="text-gray-600">
          Please review all details before creating your campaign
        </p>
      </div>

      {/* Campaign Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            campaignType === 'video' 
              ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52]' 
              : 'bg-gradient-to-r from-[#25F4EE] to-cyan-500'
          }`}>
            {campaignType === 'video' ? (
              <VideoCameraIcon className="w-6 h-6 text-white" />
            ) : (
              <UserPlusIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {campaignType === 'video' ? 'Video Campaign' : 'Follow Campaign'}
            </h3>
            <p className="text-gray-600">
              {campaignType === 'video' 
                ? `Get ${formData.interaction_type}s for your video`
                : 'Get followers for your account'
              }
            </p>
          </div>
        </div>

        {/* Video Details */}
        {campaignType === 'video' && verifiedVideoData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Target Video</h4>
            <div className="flex space-x-4">
              <img
                src={verifiedVideoData.url}
                alt="Video thumbnail"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  Creator: <span className="font-medium">@{verifiedVideoData.tiktokID}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Video ID: <span className="font-mono text-xs">{verifiedVideoData.videoID}</span>
                </p>
                <div className="flex items-center space-x-2">
                  {getInteractionIcon(formData.interaction_type)}
                  <span className="text-sm font-medium capitalize">{formData.interaction_type}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Follow Details */}
        {campaignType === 'follow' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Target Account</h4>
            <div className="flex items-center space-x-4">
              <UserPlusIcon className="w-8 h-8 text-[#25F4EE]" />
              <div>
                <p className="text-sm text-gray-600">
                  Your TikTok: <span className="font-medium">@{userProfile?.tiktok_username}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Users will follow this account
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Credits per action:</span>
              <span className="font-medium">{formData.credits_per_action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target count:</span>
              <span className="font-medium">{formData.target_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{formData.duration_days} days</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total cost:</span>
              <span className="font-bold text-[#FE2C55]">{totalCost.toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your balance:</span>
              <span className={`font-medium ${
                userProfile?.credits >= totalCost ? 'text-green-600' : 'text-red-600'
              }`}>
                {userProfile?.credits?.toLocaleString() || 0} credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Balance after:</span>
              <span className="font-medium text-gray-900">
                {((userProfile?.credits || 0) - totalCost).toLocaleString()} credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Terms & Conditions</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Your campaign will be distributed to our community of users</p>
          <p>• Credits are deducted only when actions are completed</p>
          <p>• Campaign can be paused or cancelled at any time</p>
          <p>• Unused credits will be refunded to your account</p>
          <p>• All interactions are performed by real users</p>
          <p>• Campaign duration starts immediately after creation</p>
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="bg-gradient-to-r from-[#FE2C55]/5 to-[#EE1D52]/5 border border-[#FE2C55]/20 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Ready to launch!</h4>
            <p className="text-sm text-gray-600">
              Your campaign will start immediately after creation
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}