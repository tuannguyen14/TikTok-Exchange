// 6. Main Client Component: src/app/[locale]/campaigns/create/components/CreateCampaignClient.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have this hook
import { toast } from 'sonner'; // Using sonner for toast notifications
import CampaignTypeSelector from './CampaignTypeSelector';
import VideoUrlInput from './VideoUrlInput';
import CampaignConfigForm from './CampaignConfigForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CampaignReview from './CampaignReview';
import { CreateCampaignData } from '@/lib/api/campaigns';

interface CreateCampaignClientProps {
    locale: string;
    serverTranslations: any;
}

export default function CreateCampaignClient({ locale, serverTranslations }: CreateCampaignClientProps) {
    const router = useRouter();
    const { createCampaign, loading: campaignLoading } = useCampaigns();
    const { profile, loading: userLoading } = useAuth(); // Get user profile with credits

    const [currentStep, setCurrentStep] = useState(1);
    const [campaignType, setCampaignType] = useState<'video' | 'follow' | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [verifiedVideoData, setVerifiedVideoData] = useState<any>(null);
    const [formData, setFormData] = useState({
        interaction_type: 'like',
        credits_per_action: 2,
        target_count: 100,
        duration_days: 7,
    });

    const steps = [
        { number: 1, title: serverTranslations.steps.selectType, completed: campaignType !== null },
        { number: 2, title: serverTranslations.steps.configure, completed: false },
        { number: 3, title: serverTranslations.steps.review, completed: false },
    ];

    const handleTypeSelect = (type: 'video' | 'follow') => {
        setCampaignType(type);
        setCurrentStep(2);
    };

    const handleVideoVerified = (videoData: any) => {
        setVerifiedVideoData(videoData);
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreateCampaign = async () => {
        if (!profile || !campaignType) return;

        const totalCost = formData.credits_per_action * formData.target_count;

        if (profile.credits < totalCost) {
            toast.error(serverTranslations.messages.insufficientCredits);
            return;
        }

        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + formData.duration_days);

            const campaignData = {
                campaign_type: campaignType,
                credits_per_action: formData.credits_per_action,
                target_count: formData.target_count,
                ...(campaignType === 'video' && {
                    tiktok_video_id: verifiedVideoData?.videoID,
                    interaction_type: formData.interaction_type,
                }),
                ...(campaignType === 'follow' && {
                    target_tiktok_username: profile.tiktok_username,
                }),
            };

            await createCampaign(campaignData as CreateCampaignData);

            toast.success(serverTranslations.messages.success);
            router.push('/campaigns');
        } catch (error) {
            toast.error('Failed to create campaign');
            console.error('Campaign creation error:', error);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return campaignType !== null;
            case 2:
                if (campaignType === 'video') {
                    return verifiedVideoData !== null && formData.interaction_type;
                }
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const totalCost = formData.credits_per_action * formData.target_count;

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${currentStep >= step.number
                                ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] border-[#FE2C55] text-white'
                                : 'border-gray-300 text-gray-400'
                                }`}>
                                {step.completed ? (
                                    <CheckIcon className="w-6 h-6" />
                                ) : (
                                    <span className="font-semibold">{step.number}</span>
                                )}
                            </div>
                            <div className="ml-4">
                                <div className={`font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-0.5 mx-8 ${currentStep > step.number ? 'bg-[#FE2C55]' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CampaignTypeSelector
                            selectedType={campaignType}
                            onTypeSelect={handleTypeSelect}
                            translations={serverTranslations}
                        />
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {campaignType === 'video' && (
                            <VideoUrlInput
                                value={videoUrl}
                                onChange={setVideoUrl}
                                onVideoVerified={handleVideoVerified}
                                translations={serverTranslations}
                            />
                        )}

                        <CampaignConfigForm
                            campaignType={campaignType!}
                            formData={formData}
                            onChange={handleFormChange}
                            userProfile={profile}
                            translations={serverTranslations}
                        />
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CampaignReview
                            campaignType={campaignType!}
                            formData={formData}
                            verifiedVideoData={verifiedVideoData}
                            userProfile={profile}
                            totalCost={totalCost}
                            translations={serverTranslations}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-all ${currentStep === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    {serverTranslations.buttons.back}
                </button>

                <div className="flex space-x-4">
                    <button
                        onClick={() => router.push('/campaigns')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        {serverTranslations.buttons.cancel}
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${canProceed()
                                ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white hover:from-[#EE1D52] hover:to-[#FE2C55]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {serverTranslations.buttons.next}
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateCampaign}
                            disabled={campaignLoading || profile != undefined && profile?.credits < totalCost}
                            className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${campaignLoading || profile != undefined && profile?.credits < totalCost
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white hover:from-[#EE1D52] hover:to-[#FE2C55]'
                                }`}
                        >
                            {campaignLoading ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    Creating...
                                </>
                            ) : (
                                serverTranslations.buttons.create
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}