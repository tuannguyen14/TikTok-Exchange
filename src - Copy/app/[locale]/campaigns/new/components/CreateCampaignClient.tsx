'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { ActionCreditsAPI } from '@/lib/api/actionCredits';
import { toast } from 'sonner';
import CampaignTypeSelector from './CampaignTypeSelector';
import VideoUrlInput from './VideoUrlInput';
import CampaignConfigForm from './CampaignConfigForm';
import CampaignReview from './CampaignReview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CreateCampaignData } from '@/lib/api/campaigns';

interface CreateCampaignClientProps {
    locale: string;
    serverTranslations: any;
}

export default function CreateCampaignClient({ locale, serverTranslations }: CreateCampaignClientProps) {
    const router = useRouter();
    const { createCampaign, loading: campaignLoading } = useCampaigns();
    const { profile, loading: userLoading } = useAuth();
    const [actionCredits, setActionCredits] = useState<any[]>([]);
    const [loadingCredits, setLoadingCredits] = useState(true);

    const [currentStep, setCurrentStep] = useState(1);
    const [campaignType, setCampaignType] = useState<'video' | 'follow' | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [verifiedVideoData, setVerifiedVideoData] = useState<any>(null);
    const [formData, setFormData] = useState({
        interaction_type: 'like',
        credits_per_action: 2,
        target_count: 100
    });

    // Load action credits on mount
    useEffect(() => {
        const loadActionCredits = async () => {
            const actionCreditsAPI = new ActionCreditsAPI();
            const credits = await actionCreditsAPI.getActionCredits();
            setActionCredits(credits);
            setLoadingCredits(false);
        };
        loadActionCredits();
    }, []);

    const steps = [
        {
            number: 1,
            title: serverTranslations.steps.selectType,
            completed: campaignType !== null,
            icon: '🎯'
        },
        {
            number: 2,
            title: serverTranslations.steps.configure,
            completed: false,
            icon: '⚙️'
        },
        {
            number: 3,
            title: serverTranslations.steps.review,
            completed: false,
            icon: '👀'
        },
    ];

    const handleTypeSelect = (type: 'video' | 'follow') => {
        console.log('Selected campaign type:', type); // Debug
        setCampaignType(type);

        // QUAN TRỌNG: Set formData dựa theo campaign type
        if (type === 'follow') {
            const actionCreditsAPI = new ActionCreditsAPI();
            const followCredits = actionCreditsAPI.getCreditValue('follow', actionCredits);

            setFormData(prev => ({
                ...prev,
                interaction_type: 'follow', // ← SET THÀNH 'follow'
                credits_per_action: followCredits
            }));

            console.log('Set follow formData:', {
                interaction_type: 'follow',
                credits_per_action: followCredits
            });
        } else if (type === 'video') {
            const actionCreditsAPI = new ActionCreditsAPI();
            const likeCredits = actionCreditsAPI.getCreditValue('like', actionCredits);

            setFormData(prev => ({
                ...prev,
                interaction_type: 'like', // Default cho video
                credits_per_action: likeCredits
            }));

            console.log('Set video formData:', {
                interaction_type: 'like',
                credits_per_action: likeCredits
            });
        }

        // Auto-advance to next step
        setTimeout(() => setCurrentStep(2), 300);
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

        const actionCreditsAPI = new ActionCreditsAPI();
        const creditsPerAction = campaignType === 'follow'
            ? actionCreditsAPI.getCreditValue('follow', actionCredits)
            : actionCreditsAPI.getCreditValue(formData.interaction_type, actionCredits);

        const totalCost = creditsPerAction * formData.target_count;

        if (profile.credits < totalCost) {
            toast.error(serverTranslations.messages.insufficientCredits);
            return;
        }

        try {
            const expiresAt = new Date();

            const campaignData = {
                campaign_type: campaignType,
                credits_per_action: creditsPerAction,
                target_count: formData.target_count,
                expires_at: expiresAt.toISOString(),
                ...(campaignType === 'video' && {
                    tiktok_video_id: verifiedVideoData?.videoID,
                    target_tiktok_username: verifiedVideoData?.tiktokID,
                    interaction_type: formData.interaction_type,
                }),
                ...(campaignType === 'follow' && {
                    target_tiktok_username: profile.tiktok_username,
                    interaction_type: 'follow'
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
                    return verifiedVideoData !== null &&
                        formData.interaction_type &&
                        formData.interaction_type !== '' &&
                        formData.target_count > 0;
                }
                // Cho follow campaign, không cần interaction_type
                return formData.target_count > 0;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const actionCreditsAPI = new ActionCreditsAPI();
    const currentCreditsPerAction = campaignType === 'follow'
        ? actionCreditsAPI.getCreditValue('follow', actionCredits)
        : actionCreditsAPI.getCreditValue(formData.interaction_type, actionCredits);
    const totalCost = currentCreditsPerAction * formData.target_count;

    if (userLoading || loadingCredits) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-4">
                    <LoadingSpinner />
                    <p className="text-gray-600 font-medium">{serverTranslations.messages.loadingCampaign || 'Loading campaign creator...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Enhanced Progress Steps */}
            <div className="mb-16">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] rounded-full"
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            className="relative flex flex-col items-center z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.div
                                className={`flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 ${currentStep >= step.number
                                    ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] border-[#FE2C55] text-white shadow-lg'
                                    : 'bg-white border-gray-300 text-gray-400 shadow-md'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {step.completed ? (
                                    <CheckIcon className="w-7 h-7" />
                                ) : currentStep >= step.number ? (
                                    <span className="text-2xl">{step.icon}</span>
                                ) : (
                                    <span className="font-bold text-lg">{step.number}</span>
                                )}
                            </motion.div>
                            <div className="mt-4 text-center max-w-[120px]">
                                <div className={`font-bold text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Step Content with Better Animations */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -100, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <CampaignTypeSelector
                                selectedType={campaignType}
                                onTypeSelect={handleTypeSelect}
                                actionCredits={actionCredits}
                                translations={serverTranslations}
                            />
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -100, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
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
                                actionCredits={actionCredits}
                                translations={serverTranslations}
                            />
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -100, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <CampaignReview
                                campaignType={campaignType!}
                                formData={formData}
                                verifiedVideoData={verifiedVideoData}
                                userProfile={profile}
                                totalCost={totalCost}
                                currentCreditsPerAction={currentCreditsPerAction}
                                translations={serverTranslations}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Enhanced Navigation Buttons */}
            <motion.div
                className="flex justify-between mt-12 pt-8 border-t-2 border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
                    whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
                    className={`inline-flex items-center px-8 py-4 border-2 rounded-2xl text-base font-bold transition-all duration-300 ${currentStep === 1
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                        }`}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-3" />
                    {serverTranslations.buttons.back}
                </motion.button>

                <div className="flex space-x-4">
                    <motion.button
                        onClick={() => router.push('/campaigns')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-base font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        {serverTranslations.buttons.cancel}
                    </motion.button>

                    {currentStep < 3 ? (
                        <motion.button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                            className={`inline-flex items-center px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${canProceed()
                                ? 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white hover:from-[#EE1D52] hover:to-[#FE2C55] shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
                                }`}
                        >
                            <SparklesIcon className="w-5 h-5 mr-3" />
                            {serverTranslations.buttons.next}
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={handleCreateCampaign}
                            disabled={campaignLoading || profile != undefined && profile?.credits < totalCost}
                            whileHover={{ scale: (!campaignLoading && profile != undefined && profile?.credits >= totalCost) ? 1.02 : 1 }}
                            whileTap={{ scale: (!campaignLoading && profile != undefined && profile?.credits >= totalCost) ? 0.98 : 1 }}
                            className={`inline-flex items-center px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${campaignLoading || profile != undefined && profile?.credits < totalCost
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
                                : 'bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] text-white hover:from-[#EE1D52] hover:to-[#FE2C55] shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {campaignLoading ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    {serverTranslations.buttons.creating}
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-3" />
                                    {serverTranslations.buttons.create}
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}