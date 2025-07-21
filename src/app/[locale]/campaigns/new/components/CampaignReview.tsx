// Enhanced Campaign Review Component: src/app/[locale]/campaigns/create/components/CampaignReview.tsx
'use client';

import { motion } from 'framer-motion';
import {
  VideoCameraIcon,
  UserPlusIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  EyeIcon as EyeSolid,
  ChatBubbleLeftIcon as ChatSolid
} from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';

interface CampaignReviewProps {
  campaignType: 'video' | 'follow';
  formData: any;
  verifiedVideoData: any;
  userProfile: any;
  totalCost: number;
  currentCreditsPerAction: number;
  translations: any;
}

export default function CampaignReview({
  campaignType,
  formData,
  verifiedVideoData,
  userProfile,
  totalCost,
  currentCreditsPerAction,
  translations
}: CampaignReviewProps) {

  const t = useTranslations('CreateCampaign');
  const getInteractionIcon = (type: string, variant: 'outline' | 'solid' = 'solid') => {
    const icons = {
      outline: {
        like: <HeartIcon className="w-5 h-5 text-[#FE2C55]" />,
        view: <EyeIcon className="w-5 h-5 text-blue-500" />,
        comment: <ChatBubbleLeftIcon className="w-5 h-5 text-emerald-500" />
      },
      solid: {
        like: <HeartSolid className="w-5 h-5 text-[#FE2C55]" />,
        view: <EyeSolid className="w-5 h-5 text-blue-500" />,
        comment: <ChatSolid className="w-5 h-5 text-emerald-500" />
      }
    };
    return icons[variant][type as keyof typeof icons.solid] || null;
  };

  const getInteractionColor = (type: string) => {
    const colors = {
      like: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-[#FE2C55]' },
      view: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
      comment: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' }
    };
    return colors[type as keyof typeof colors] || colors.like;
  };

  const formatCount = (count: number | string) => {
    const num = typeof count === 'string' ? parseInt(count) : count;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const isBalanceSufficient = userProfile?.credits >= totalCost;
  const remainingBalance = (userProfile?.credits || 0) - totalCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#FE2C55]/10 to-[#EE1D52]/10 rounded-full px-8 py-4 border-2 border-[#FE2C55]/20"
        >
          <SparklesIcon className="w-6 h-6 text-[#FE2C55]" />
          <h2 className="text-2xl font-bold text-gray-900">{translations.review.title}</h2>
        </motion.div>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          {translations.review.subtitle}
        </p>
      </div>

      {/* Campaign Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 shadow-xl"
      >
        {/* Campaign Type Header */}
        <div className="flex items-center space-x-6 mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${campaignType === 'video'
            ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52]'
            : 'bg-gradient-to-r from-[#25F4EE] to-cyan-500'
            }`}>
            {campaignType === 'video' ? (
              <VideoCameraIcon className="w-8 h-8 text-white" />
            ) : (
              <UserPlusIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {campaignType === 'video' ? translations.review.videoEngagementCampaign : translations.review.followerGrowthCampaign}
            </h3>
            <p className="text-gray-600 text-lg">
              {campaignType === 'video' && formData.interaction_type
                ? t('review.boostVideoWith', { type: formData.interaction_type })
                : campaignType === 'follow'
                  ? translations.review.growFollowing
                  : 'Please select interaction type'
              }
            </p>
          </div>
          <div className={`px-6 py-3 rounded-full font-bold text-white shadow-lg ${campaignType === 'video'
            ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52]'
            : 'bg-gradient-to-r from-[#25F4EE] to-cyan-500'
            }`}>
            {currentCreditsPerAction} credits/{campaignType === 'video' ? formData.interaction_type : 'follow'}
          </div>
        </div>

        {/* Video Campaign Details */}
        {campaignType === 'video' && verifiedVideoData && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <VideoCameraIcon className="w-6 h-6 text-[#FE2C55]" />
              <h4 className="font-bold text-gray-900 text-lg">{translations.review.targetVideo}</h4>
            </div>

            <div className="flex space-x-6">
              {/* Video Thumbnail */}
              <div className="relative group">
                <img
                  src={verifiedVideoData.url}
                  alt="Video thumbnail"
                  className="w-24 h-24 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">{translations.review.creator}:</span>
                  <div className="bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white px-4 py-2 rounded-full text-sm font-bold">
                    @{verifiedVideoData.tiktokID}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">{translations.review.videoId}:</span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                    {verifiedVideoData.videoID}
                  </span>
                </div>

                {/* Current Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: translations.review.views, value: formatCount(verifiedVideoData.playCount), icon: EyeSolid, color: 'text-blue-600' },
                    { label: translations.review.likes, value: formatCount(verifiedVideoData.diggCount), icon: HeartSolid, color: 'text-[#FE2C55]' },
                    { label: translations.review.comments, value: formatCount(verifiedVideoData.commentCount), icon: ChatSolid, color: 'text-emerald-600' },
                    { label: translations.review.shares, value: formatCount(verifiedVideoData.shareCount), icon: ArrowRightIcon, color: 'text-purple-600' }
                  ].map((stat, index) => (
                    <div key={stat.label} className="text-center bg-gray-50 rounded-xl p-3">
                      <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                      <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Interaction Type */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">{translations.review.targetInteraction}:</span>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${getInteractionColor(formData.interaction_type).bg} ${getInteractionColor(formData.interaction_type).border}`}>
                    {getInteractionIcon(formData.interaction_type)}
                    <span className={`font-bold capitalize ${getInteractionColor(formData.interaction_type).text}`}>
                      {formData.interaction_type}s
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {t('review.creditsPerAction', { action: formData.interaction_type })}
                  </div>
                  <div className="text-lg font-bold text-[#FE2C55]">{currentCreditsPerAction}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Follow Campaign Details */}
        {campaignType === 'follow' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#25F4EE]/5 to-cyan-50 rounded-2xl p-6 border-2 border-[#25F4EE]/20 mb-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <UserPlusIcon className="w-6 h-6 text-[#25F4EE]" />
              <h4 className="font-bold text-gray-900 text-lg">{translations.review.targetAccount}</h4>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#25F4EE] to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlusIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-gray-900 mb-1">@{userProfile?.tiktok_username}</div>
                <p className="text-gray-600 mb-3">{translations.review.accountDescription}</p>
                <div className="flex items-center space-x-6">
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">{translations.review.creditsPerFollow}: </span>
                    <span className="font-bold text-[#25F4EE]">{currentCreditsPerAction}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaign Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {t('review.creditsPerAction', { action: formData.interaction_type })}
                </div>
                <div className="text-2xl font-bold text-gray-900">{currentCreditsPerAction}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {t('review.creditsPerAction', { action: formData.interaction_type })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">🎯</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">{translations.review.targetGoal}</div>
                <div className="text-2xl font-bold text-gray-900">{formData.target_count.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {campaignType === 'video' ? `${formData.interaction_type}s` : translations.review.followersToReceive}
            </div>
          </div>

        
        </motion.div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-xl flex items-center justify-center shadow-lg">
            <CurrencyDollarIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{translations.review.costBreakdown}</h3>
        </div>

        <div className="space-y-6">
          {/* Calculation Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  {t('review.creditsPerAction', { action: formData.interaction_type })}
                </div>
                <div className="text-3xl font-bold text-[#FE2C55]">{currentCreditsPerAction}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">× {translations.review.targetGoal}</div>
                <div className="text-3xl font-bold text-gray-900">{formData.target_count.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">= {translations.review.totalCost}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] bg-clip-text text-transparent">
                  {totalCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border-2 ${isBalanceSufficient
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBalanceSufficient ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                  {isBalanceSufficient ? (
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">{translations.review.currentBalance}</div>
                  <div className={`text-2xl font-bold ${isBalanceSufficient ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {userProfile?.credits?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
              <div className={`text-sm ${isBalanceSufficient ? 'text-emerald-700' : 'text-red-700'
                }`}>
                {isBalanceSufficient ? '✓ Sufficient balance' : '⚠️ Insufficient credits'}
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-lg">💰</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">{translations.review.balanceAfter}</div>
                  <div className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                    }`}>
                    {remainingBalance.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {translations.review.remainingCredits}
              </div>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {!isBalanceSufficient && (
            <motion.div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-lg mb-2">{t('form.insufficientCredits')}</h4>
                  <p className="text-red-800 mb-4">
                    {t('review.needMoreCredits', {
                      amount: (totalCost - (userProfile?.credits || 0)).toLocaleString()
                    })}
                  </p>
                  <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    {t('form.topUpCredits')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Terms and Launch */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{translations.review.campaignTerms}</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Terms */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-4">{translations.review.importantTerms}</h4>
            <div className="space-y-3 text-sm text-gray-700">
              {[
                translations.review.terms.distributedToCommunity,
                translations.review.terms.creditsOnlyOnCompletion,
                translations.review.terms.pauseAnytime,
                translations.review.terms.unusedCreditsRefunded,
                translations.review.terms.realUsers,
                translations.review.terms.resultsVary
              ].map((term, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Confirmation */}
          <div className="bg-gradient-to-r from-[#FE2C55]/5 to-[#EE1D52]/5 border-2 border-[#FE2C55]/20 rounded-2xl p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-full flex items-center justify-center mx-auto shadow-lg">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-xl">{translations.review.readyToLaunch}</h4>
              <p className="text-gray-700">
                {t('review.campaignStartsImmediately', {
                  type: campaignType === 'video' ? formData.interaction_type + 's' : 'followers'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}