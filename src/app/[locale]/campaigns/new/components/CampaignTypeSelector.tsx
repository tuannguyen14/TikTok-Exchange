'use client';

import { motion } from 'framer-motion';
import { VideoCameraIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

interface CampaignTypeSelectorProps {
  selectedType: 'video' | 'follow' | null;
  onTypeSelect: (type: 'video' | 'follow') => void;
  actionCredits: any[];
  translations: any;
}

export default function CampaignTypeSelector({ 
  selectedType, 
  onTypeSelect, 
  actionCredits,
  translations 
}: CampaignTypeSelectorProps) {
  const getCreditValue = (actionType: string) => {
    const action = actionCredits.find(a => a.action_type === actionType);
    return action?.credit_value || 0;
  };

  const typeOptions = [
    {
      type: 'video' as const,
      title: translations.campaignTypes.video.title,
      description: translations.campaignTypes.video.description,
      icon: VideoCameraIcon,
      gradient: 'from-[#FE2C55] via-[#FF6B9D] to-[#EE1D52]',
      glowColor: 'shadow-[#FE2C55]/30',
      interactions: [
        { 
          type: 'view', 
          icon: EyeIcon, 
          label: translations.campaignTypes.video.interactions.view, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          credits: getCreditValue('view')
        },
        { 
          type: 'like', 
          icon: HeartIcon, 
          label: translations.campaignTypes.video.interactions.like, 
          color: 'text-[#FE2C55]',
          bgColor: 'bg-pink-100',
          credits: getCreditValue('like')
        },
        { 
          type: 'comment', 
          icon: ChatBubbleLeftIcon, 
          label: translations.campaignTypes.video.interactions.comment, 
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          credits: getCreditValue('comment')
        }
      ]
    },
    {
      type: 'follow' as const,
      title: translations.campaignTypes.follow.title,
      description: translations.campaignTypes.follow.description,
      icon: UserPlusIcon,
      gradient: 'from-[#25F4EE] via-[#00D4FF] to-[#0EA5E9]',
      glowColor: 'shadow-[#25F4EE]/30',
      credits: getCreditValue('follow'),
      interactions: []
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FE2C55]/10 to-[#25F4EE]/10 rounded-full px-6 py-3 mb-6"
        >
          <SparklesIcon className="w-5 h-5 text-[#FE2C55]" />
          <span className="text-gray-800 font-medium">Choose Your Campaign Type</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {typeOptions.map((option, index) => (
          <motion.div
            key={option.type}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTypeSelect(option.type)}
            className={`group relative overflow-hidden cursor-pointer rounded-3xl border-2 transition-all duration-500 ${
              selectedType === option.type
                ? `border-transparent bg-white shadow-2xl ${option.glowColor}`
                : 'border-gray-100 bg-white hover:border-gray-200 shadow-xl hover:shadow-2xl'
            }`}
          >
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} transition-opacity duration-500 ${
              selectedType === option.type ? 'opacity-[0.02]' : 'opacity-0 group-hover:opacity-[0.01]'
            }`} />
            
            {/* Animated Orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl transform -translate-x-12 translate-y-12" />

            <div className="relative p-8">
              {/* Header with Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} shadow-lg`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Credit Badge for Follow */}
                {option.type === 'follow' && (
                  <div className="bg-gradient-to-r from-[#25F4EE] to-[#0EA5E9] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {option.credits} credits
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {option.title}
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed text-base">
                {option.description}
              </p>

              {/* Interactions for video type */}
              {option.interactions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800 mb-4">Available interactions:</p>
                  <div className="grid gap-3">
                    {option.interactions.map((interaction) => (
                      <div key={interaction.type} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${interaction.bgColor} rounded-lg flex items-center justify-center`}>
                            <interaction.icon className={`w-5 h-5 ${interaction.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{interaction.label}</span>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                          <span className="text-sm font-bold text-gray-900">{interaction.credits} credits</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection indicator with animation */}
              {selectedType === option.type && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-[#FE2C55] to-[#EE1D52] rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} 
                   style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor' }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}