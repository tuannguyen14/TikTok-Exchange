// 4. Video URL Input & Verification: src/app/[locale]/campaigns/create/components/VideoUrlInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useTikTokApi } from '@/hooks/useTikTok';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
  const { getVideoInfo, extractVideoId } = useTikTokApi();

  const isValidUrl = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/,
      /(?:https?:\/\/)?vt\.tiktok\.com\/([A-Za-z0-9]+)/,
      /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9]+)/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleVerify = async () => {
    if (!value.trim()) {
      setError(translations.messages.invalidUrl);
      return;
    }

    if (!isValidUrl(value)) {
      setError(translations.messages.invalidUrl);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await getVideoInfo(value);
      
      if (result.success && result.data) {
        setVerificationResult(result.data);
        onVideoVerified(result.data);
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
    return num.toString();
  };

  useEffect(() => {
    if (value && verificationResult) {
      setVerificationResult(null);
    }
    setError('');
  }, [value]);

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {translations.form.videoUrl}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={translations.form.videoUrlPlaceholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE2C55] focus:border-[#FE2C55] outline-none transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !value.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-md hover:from-[#EE1D52] hover:to-[#FE2C55] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isVerifying ? (
                <>
                  <LoadingSpinner size="sm" />
                  Verifying...
                </>
              ) : (
                translations.buttons.verify
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-600"
          >
            <ExclamationCircleIcon className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Verification Result */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {translations.form.videoVerification}
              </h3>
            </div>

            <div className="flex space-x-4">
              {/* Video Thumbnail */}
              <div className="flex-shrink-0">
                <img
                  src={verificationResult.url}
                  alt="Video thumbnail"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              {/* Video Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Creator:</span>
                  <span className="font-medium text-gray-900">@{verificationResult.tiktokID}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCount(verificationResult.playCount)}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FE2C55]">
                      {formatCount(verificationResult.diggCount)}
                    </div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCount(verificationResult.commentCount)}
                    </div>
                    <div className="text-xs text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCount(verificationResult.shareCount)}
                    </div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Video verified successfully! You can now proceed to configure your campaign.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}