// 5. Campaign Configuration Form: src/app / [locale] / campaigns / create / components / CampaignConfigForm.tsx
'use client';

import { motion } from 'framer-motion';
import { HeartIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { useTikTokProfile } from '@/hooks/useTikTok';

interface CampaignConfigFormProps {
    campaignType: 'video' | 'follow';
    formData: any;
    onChange: (field: string, value: any) => void;
    userProfile: any;
    translations: any;
}

export default function CampaignConfigForm({
    campaignType,
    formData,
    onChange,
    userProfile,
    translations
}: CampaignConfigFormProps) {
    const { data: profileData } = useTikTokProfile(userProfile?.tiktok_username);

    const interactionOptions = [
        { type: 'view', icon: EyeIcon, label: translations.campaignTypes.video.interactions.view, color: 'text-blue-500', minCredits: 1 },
        { type: 'like', icon: HeartIcon, label: translations.campaignTypes.video.interactions.like, color: 'text-[#FE2C55]', minCredits: 2 },
        { type: 'comment', icon: ChatBubbleLeftIcon, label: translations.campaignTypes.video.interactions.comment, color: 'text-green-500', minCredits: 5 }
    ];

    const totalCost = formData.credits_per_action * formData.target_count;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Follow Campaign - Show Target Profile */}
            {campaignType === 'follow' && profileData && (
                <div className="bg-gradient-to-r from-[#25F4EE]/10 to-cyan-50 rounded-xl p-6 border border-[#25F4EE]/20">
                    <div className="flex items-center space-x-4">
                        <img
                            src={profileData.user.avatarThumb}
                            alt={profileData.user.nickname}
                            className="w-16 h-16 rounded-full"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                @{profileData.user.uniqueId}
                            </h3>
                            <p className="text-gray-600">{profileData.user.nickname}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500">
                                    {profileData.stats.followerCount} followers
                                </span>
                                <span className="text-sm text-gray-500">
                                    {profileData.stats.followingCount} following
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interaction Type Selection (Video only) */}
            {campaignType === 'video' && (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        {translations.form.interactionType}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {interactionOptions.map((option) => (
                            <motion.button
                                key={option.type}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onChange('interaction_type', option.type)}
                                className={`p-4 rounded-lg border-2 transition-all ${formData.interaction_type === option.type
                                    ? 'border-[#FE2C55] bg-[#FE2C55]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <option.icon className={`w-6 h-6 ${option.color}`} />
                                    <div className="text-left">
                                        <div className="font-medium text-gray-900">{option.label}</div>
                                        <div className="text-sm text-gray-500">Min: {option.minCredits} credits</div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Credits per Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {translations.form.creditsPerAction}
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.credits_per_action}
                            onChange={(e) => onChange('credits_per_action', parseInt(e.target.value))}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE2C55] focus:border-[#FE2C55] outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-sm text-gray-500">credits</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Higher rewards attract more users
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {translations.form.targetCount}
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.target_count}
                        onChange={(e) => onChange('target_count', parseInt(e.target.value))}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE2C55] focus:border-[#FE2C55] outline-none"
                    />
                    <p className="text-xs text-gray-500">
                        {campaignType === 'video'
                            ? `Target ${formData.interaction_type}s for your video`
                            : 'Target followers for your account'
                        }
                    </p>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {translations.form.totalCost}
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Credits per action:</span>
                        <span className="font-medium">{formData.credits_per_action}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Target count:</span>
                        <span className="font-medium">{formData.target_count}</span>
                    </div>
                    <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total cost:</span>
                            <span className="text-[#FE2C55]">{totalCost.toLocaleString()} credits</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Your balance:</span>
                        <span className={`font-medium ${userProfile?.credits >= totalCost ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {userProfile?.credits?.toLocaleString() || 0} credits
                        </span>
                    </div>
                </div>
            </div>

            {/* Insufficient Credits Warning */}
            {userProfile?.credits < totalCost && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">
                            {translations.messages.insufficientCredits}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}