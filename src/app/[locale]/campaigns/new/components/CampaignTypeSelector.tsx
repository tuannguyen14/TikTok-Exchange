// 3. Campaign Type Selection: src/app/[locale]/campaigns/create/components/CampaignTypeSelector.tsx
'use client';

import { motion } from 'framer-motion';
import { VideoCameraIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

interface CampaignTypeSelectorProps {
    selectedType: 'video' | 'follow' | null;
    onTypeSelect: (type: 'video' | 'follow') => void;
    translations: any;
}

export default function CampaignTypeSelector({
    selectedType,
    onTypeSelect,
    translations
}: CampaignTypeSelectorProps) {
    const typeOptions = [
        {
            type: 'video' as const,
            title: translations.campaignTypes.video.title,
            description: translations.campaignTypes.video.description,
            icon: VideoCameraIcon,
            gradient: 'from-[#FE2C55] to-[#EE1D52]',
            bgGradient: 'from-pink-50 to-red-50',
            borderColor: 'border-[#FE2C55]',
            interactions: [
                { type: 'view', icon: EyeIcon, label: translations.campaignTypes.video.interactions.view, color: 'text-blue-500' },
                { type: 'like', icon: HeartIcon, label: translations.campaignTypes.video.interactions.like, color: 'text-[#FE2C55]' },
                { type: 'comment', icon: ChatBubbleLeftIcon, label: translations.campaignTypes.video.interactions.comment, color: 'text-green-500' }
            ]
        },
        {
            type: 'follow' as const,
            title: translations.campaignTypes.follow.title,
            description: translations.campaignTypes.follow.description,
            icon: UserPlusIcon,
            gradient: 'from-[#25F4EE] to-cyan-500',
            bgGradient: 'from-cyan-50 to-blue-50',
            borderColor: 'border-[#25F4EE]',
            interactions: []
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {typeOptions.map((option, index) => (
                    <motion.div
                        key={option.type}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTypeSelect(option.type)}
                        className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-300 ${selectedType === option.type
                            ? `${option.borderColor} bg-gradient-to-br ${option.bgGradient} shadow-xl`
                            : 'border-gray-200 bg-white hover:border-gray-300 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {/* Animated background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 transition-opacity duration-300 ${selectedType === option.type ? 'opacity-5' : ''
                            }`} />

                        <div className="relative p-8">
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${option.gradient} mb-6`}>
                                <option.icon className="w-8 h-8 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {option.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {option.description}
                            </p>

                            {/* Interactions for video type */}
                            {option.interactions.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Available interactions:</p>
                                    {option.interactions.map((interaction) => (
                                        <div key={interaction.type} className="flex items-center space-x-3">
                                            <interaction.icon className={`w-5 h-5 ${interaction.color}`} />
                                            <span className="text-sm text-gray-600">{interaction.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selection indicator */}
                            {selectedType === option.type && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#FE2C55] to-[#EE1D52] rounded-full flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
