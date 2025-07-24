'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkIcon, CheckCircleIcon, ExclamationCircleIcon, EyeIcon, PlayIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useTikTokApi } from '@/hooks/useTikTok';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { validateTikTokURL } from '@/lib/utils/validate-video-url';

interface VideoUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onVideoVerified: (videoData: any) => void;
  translations: any;
}

export default function VideoUrlInput({
  value,
  onChange,
  onVideoVerified,
  translations
}: VideoUrlInputProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const { getPostDetail } = useTikTokApi();

  const handleVerify = async () => {
    const validateResult = validateTikTokURL(value);
    if (!validateResult.isValid) {
      setError(translations.messages.invalidUrl);
      return;
    }
    setIsVerifying(true);
    setError('');

    if (!validateResult.videoId) {
      setError(translations.messages.invalidUrl);
      return;
    }

    try {
      const result = await getPostDetail(validateResult.videoId);

      if (result.success && result.data) {
        // Transform the new API response to match expected format
        const postDetail = result.data;
        if (postDetail) {
          const transformedData = {
            collectCount: postDetail.collectCount,
            commentCount: postDetail.commentCount,
            diggCount: postDetail.diggCount,
            playCount: postDetail.playCount,
            shareCount: postDetail.shareCount,
            tiktokID: postDetail.tiktokID,
            url: postDetail.url,
            videoID: postDetail.videoID
          };

          setVerificationResult(transformedData);
          onVideoVerified(transformedData);
        } else {
          setError(translations.messages.verificationFailed);
          setVerificationResult(null);
        }
      } else {
        setError(result.error || translations.messages.verificationFailed);
        setVerificationResult(null);
      }
    } catch (err) {
      setError(translations.messages.verificationFailed);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced URL Input */}
      <div className="space-y-3">
        <label className="block text-base font-semibold text-gray-900">
          {translations.form.videoUrl}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LinkIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#FE2C55] transition-colors" />
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={translations.form.videoUrlPlaceholder}
            className="block w-full pl-12 pr-32 py-4 text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] outline-none transition-all duration-300 text-base font-medium shadow-sm hover:shadow-md"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !value.trim()}
              className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-xl hover:from-[#EE1D52] hover:to-[#FE2C55] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-sm"
            >
              {isVerifying ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{translations.form.verifying}</span>
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  <span>{translations.buttons.verify}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200"
          >
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Enhanced Verification Result */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 border-2 border-green-200 rounded-2xl p-6 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {translations.form.videoVerification}
                </h3>
                <p className="text-sm text-gray-600">{translations.form.success}</p>
              </div>
            </div>

            {/* Video Content */}
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
              {/* Enhanced Video Thumbnail */}
              <div className="flex-shrink-0 relative group">
                <div className="relative">
                  <img
                    src={verificationResult.url}
                    alt="Video thumbnail"
                    className="w-32 h-40 lg:w-24 lg:h-32 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-lg text-xs font-medium">
                    {formatDuration(verificationResult.video?.duration || 0)}
                  </div>
                </div>
              </div>

              {/* Enhanced Video Info */}
              <div className="flex-1 space-y-4">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={verificationResult.author?.avatarThumb || ''}
                    alt={verificationResult.author?.nickname || ''}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">
                        {verificationResult.author?.nickname || verificationResult.tiktokID}
                      </span>
                      {verificationResult.author?.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
                      @{verificationResult.tiktokID}
                    </div>
                  </div>
                </div>

                {/* Video Description */}
                {verificationResult.desc && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {verificationResult.desc}
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Views',
                      value: formatCount(verificationResult.playCount),
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      icon: <EyeIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Likes',
                      value: formatCount(verificationResult.diggCount),
                      color: 'text-[#FE2C55]',
                      bg: 'bg-pink-50',
                      icon: <HeartIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Comments',
                      value: formatCount(verificationResult.commentCount),
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                      icon: <ChatBubbleLeftIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Shares',
                      value: formatCount(verificationResult.shareCount),
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                      icon: <ShareIcon className="w-4 h-4" />
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`text-center p-3 ${stat.bg} rounded-xl border border-gray-100 hover:shadow-md transition-shadow`}
                    >
                      <div className={`flex items-center justify-center space-x-1 mb-1 ${stat.color}`}>
                        {stat.icon}
                        <div className="text-lg font-bold">
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Footer */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  {translations.form.ready}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}