'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, EyeIcon, ChatBubbleLeftIcon, UserPlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { useTikTokProfile } from '@/hooks/useTikTok';
import { ActionCreditsAPI } from '@/lib/api/actionCredits';
import { useTranslations } from 'next-intl';

interface CampaignConfigFormProps {
    campaignType: 'video' | 'follow';
    formData: any;
    onChange: (field: string, value: any) => void;
    userProfile: any;
    actionCredits: any[];
    translations: any;
}

export default function CampaignConfigForm({
    campaignType,
    formData,
    onChange,
    userProfile,
    actionCredits,
    translations
}: CampaignConfigFormProps) {
    const t = useTranslations('CreateCampaign');
    const { data: profileData } = useTikTokProfile(userProfile?.tiktok_username);
    const actionCreditsAPI = new ActionCreditsAPI();

    const getCreditValue = (actionType: string) => {
        return actionCreditsAPI.getCreditValue(actionType, actionCredits);
    };

    const interactionOptions = [
        {
            type: 'view',
            icon: EyeIcon,
            label: translations.campaignTypes.video.interactions.view,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            credits: getCreditValue('view')
        },
        {
            type: 'like',
            icon: HeartIcon,
            label: translations.campaignTypes.video.interactions.like,
            color: 'text-[#FE2C55]',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            credits: getCreditValue('like')
        },
        {
            type: 'comment',
            icon: ChatBubbleLeftIcon,
            label: translations.campaignTypes.video.interactions.comment,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            credits: getCreditValue('comment')
        }
    ];

    const currentCreditsPerAction = campaignType === 'follow'
        ? getCreditValue('follow')
        : (formData.interaction_type ? getCreditValue(formData.interaction_type) : 0);

    const totalCost = currentCreditsPerAction * formData.target_count;

    useEffect(() => {
        if (campaignType === 'video' && formData.interaction_type && formData.interaction_type !== 'follow') {
            const credits = getCreditValue(formData.interaction_type);
            onChange('credits_per_action', credits);
            console.log('Set video credits:', credits);
        } else if (campaignType === 'follow') {
            const credits = getCreditValue('follow');
            onChange('credits_per_action', credits);

            // Đảm bảo interaction_type là 'follow'
            if (formData.interaction_type !== 'follow') {
                onChange('interaction_type', 'follow');
                console.log('Force set interaction_type to follow');
            }
        }
    }, [formData.interaction_type, campaignType, actionCredits]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            {/* Follow Campaign - Enhanced Target Profile */}
            {campaignType === 'follow' && profileData && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-[#25F4EE]/5 via-cyan-50/50 to-blue-50/50 rounded-2xl p-6 border-2 border-[#25F4EE]/20 shadow-lg"
                >
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img
                                src={profileData.user.avatarThumb}
                                alt={profileData.user.nickname}
                                className="w-20 h-20 rounded-2xl shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#25F4EE] to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                <UserPlusIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900 mb-1">
                            @{profileData.user.uniqueId}
                        </div>
                        <p className="text-gray-700 font-medium mb-3">{profileData.user.nickname}</p>
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{profileData.stats.followerCount}</div>
                                <div className="text-xs font-medium text-gray-600">{translations.review.followers}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{profileData.stats.followingCount}</div>
                                <div className="text-xs font-medium text-gray-600">{translations.review.following}</div>
                            </div>
                            <div className="bg-gradient-to-r from-[#25F4EE] to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                {getCreditValue('follow')} {translations.form.creditsPerFollow}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Enhanced Interaction Type Selection (Video only) */}
            {campaignType === 'video' && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {translations.form.interactionType}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {interactionOptions.map((option, index) => {
                            const isDisabled = option.type === 'view' || option.type === 'comment';

                            return (
                                <motion.button
                                    key={option.type}
                                    type="button"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                    disabled={isDisabled}
                                    onClick={() => !isDisabled && onChange('interaction_type', option.type)}
                                    className={`
                relative p-5 rounded-2xl border-2 transition-all duration-300
                ${formData.interaction_type === option.type
                                            ? `${option.borderColor} ${option.bgColor} shadow-lg ring-4 ring-blue-500/10`
                                            : isDisabled
                                                ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                        }
            `}
                                >
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center`}>
                                            <option.icon className={`w-7 h-7 ${option.color}`} />
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-gray-900 text-base">{option.label}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-semibold">{option.credits} credits</span> each
                                            </div>
                                            {isDisabled && (
                                                <div className="text-xs text-gray-400 mt-2 italic">
                                                    Tính năng đang khóa
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {formData.interaction_type === option.type && !isDisabled && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}

                    </div>
                </div>
            )}

            {/* Enhanced Target Count Input */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {translations.form.targetCount}
                    </h3>
                </div>

                <div className="relative group">
                    <input
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.target_count}
                        onChange={(e) => onChange('target_count', parseInt(e.target.value) || 0)}
                        className="block w-full px-6 py-4 text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] outline-none transition-all duration-300 text-lg font-semibold shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                        placeholder={translations.form.targetCountPlaceholder}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                        <span className="text-sm font-medium text-gray-600">
                            {campaignType === 'video'
                                ? `${formData.interaction_type}s`
                                : 'followers'
                            }
                        </span>
                    </div>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                    💡 {campaignType === 'video'
                        ? t('form.targetInfo', { type: formData.interaction_type })
                        : t('form.followersTargetInfo')
                    }
                </p>
            </div>

            {/* Enhanced Cost Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-xl flex items-center justify-center shadow-lg">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {translations.form.totalCost}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600">
                                {t('review.creditsPerAction', { action: formData.interaction_type })}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{currentCreditsPerAction}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm font-medium text-gray-600 mb-1">{translations.form.targetCount}</div>
                            <div className="text-2xl font-bold text-gray-900">{formData.target_count.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-lg font-semibold text-gray-900">{translations.form.totalCost}:</div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] bg-clip-text text-transparent">
                                {totalCost.toLocaleString()} credits
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                            <div className="text-gray-700 font-medium">{translations.form.currentBalance}:</div>
                            <span className={`font-bold text-lg ${userProfile?.credits >= totalCost ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                {userProfile?.credits?.toLocaleString() || 0} credits
                            </span>
                        </div>
                        {userProfile?.credits >= totalCost && (
                            <div className="flex justify-between items-center text-base mt-2 pt-2 border-t border-gray-200">
                                <div className="text-gray-700 font-medium">{translations.form.balanceAfterCampaign}:</div>
                                <span className="font-bold text-lg text-gray-900">
                                    {((userProfile?.credits || 0) - totalCost).toLocaleString()} credits
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Insufficient Credits Warning */}
            {
                userProfile?.credits < totalCost && (
                    <motion.div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-red-900 text-lg mb-1">{t('form.insufficientCredits')}</h4>
                                <p className="text-red-800 font-medium mb-3">
                                    {t('form.insufficientCreditsDesc', {
                                        amount: (totalCost - (userProfile?.credits || 0)).toLocaleString()
                                    })}
                                </p>
                                <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    {t('form.topUpCredits')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )
            }
        </motion.div >
    );
}