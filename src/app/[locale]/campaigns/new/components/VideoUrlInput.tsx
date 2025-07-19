'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkIcon, CheckCircleIcon, ExclamationCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
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
    return num.toLocaleString();
  };

  useEffect(() => {
    if (value && verificationResult) {
      setVerificationResult(null);
    }
    setError('');
  }, [value]);

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

            <div className="flex space-x-6">
              {/* Enhanced Video Thumbnail */}
              <div className="flex-shrink-0 relative group">
                <img
                  src={verificationResult.url}
                  alt="Video thumbnail"
                  className="w-24 h-24 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Enhanced Video Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">{translations.form.creator}:</span>
                  <div className="bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white px-3 py-1 rounded-full text-sm font-bold">
                    @{verificationResult.tiktokID}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Views', value: formatCount(verificationResult.playCount), color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Likes', value: formatCount(verificationResult.diggCount), color: 'text-[#FE2C55]', bg: 'bg-pink-50' },
                    { label: 'Comments', value: formatCount(verificationResult.commentCount), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Shares', value: formatCount(verificationResult.shareCount), color: 'text-purple-600', bg: 'bg-purple-50' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`text-center p-3 ${stat.bg} rounded-xl border border-gray-100`}
                    >
                      <div className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

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