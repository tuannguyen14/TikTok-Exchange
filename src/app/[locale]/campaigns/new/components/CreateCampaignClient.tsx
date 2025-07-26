'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CreateCampaignData } from '@/lib/api/campaigns';
import { useTranslations } from 'next-intl';

// Mantine v8 imports
import {
    Container,
    Stepper,
    Button,
    Group,
    Paper,
    Loader,
    Stack,
    Flex,
    Box,
    rem
} from '@mantine/core';
import {
    IconCheck,
    IconArrowLeft,
    IconSparkles,
    IconTarget,
    IconSettings,
    IconEye,
    IconAlertCircle
} from '@tabler/icons-react';
import LoadingSpinner from '@/components/ui/loading/loading-overlay';
import { notifications } from '@mantine/notifications';

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

    const [currentStep, setCurrentStep] = useState(0);
    const [campaignType, setCampaignType] = useState<'video' | 'follow' | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [verifiedVideoData, setVerifiedVideoData] = useState<any>(null);
    const [formData, setFormData] = useState({
        interaction_type: 'like',
        credits_per_action: 2,
        target_count: 100
    });

    const t = useTranslations('Common');

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

    useEffect(() => {
        if (profile && !userLoading) {
            if (!profile.tiktok_username) {
                router.push('/profile');
                notifications.show({
                    title: t('NeedToConnectTikTok'),
                    message: t('PleaseConnectYourTikTokAccountToUseThisFeature'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            }
        }
    }, [profile, userLoading, router, t]);

    const stepData = [
        {
            label: serverTranslations.steps.selectType,
            icon: IconTarget,
            description: serverTranslations.steps.selectTypeDescription
        },
        {
            label: serverTranslations.steps.configure,
            icon: IconSettings,
            description: serverTranslations.steps.configureDescription
        },
        {
            label: serverTranslations.steps.review,
            icon: IconEye,
            description: serverTranslations.steps.reviewDescription
        },
    ];

    const handleTypeSelect = (type: 'video' | 'follow') => {
        console.log('Selected campaign type:', type);
        setCampaignType(type);

        if (type === 'follow') {
            const actionCreditsAPI = new ActionCreditsAPI();
            const followCredits = actionCreditsAPI.getCreditValue('follow', actionCredits);

            setFormData(prev => ({
                ...prev,
                interaction_type: 'follow',
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
                interaction_type: 'like',
                credits_per_action: likeCredits
            }));

            console.log('Set video formData:', {
                interaction_type: 'like',
                credits_per_action: likeCredits
            });
        }

        // Auto-advance to next step
        setTimeout(() => setCurrentStep(1), 300);
    };

    const handleVideoVerified = (videoData: any) => {
        setVerifiedVideoData(videoData);
    };

    const handleFormChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNext = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreateCampaign = async () => {
        if (!profile || !campaignType) return;

        const actionCreditsAPI = new ActionCreditsAPI();
        const currentCreditsPerAction = campaignType === 'follow'
            ? actionCreditsAPI.getCreditValue('follow', actionCredits)
            : actionCreditsAPI.getCreditValue(formData.interaction_type, actionCredits);
        const totalCost = currentCreditsPerAction * formData.target_count;

        if (profile.credits < totalCost) {
            toast.error(serverTranslations.messages.insufficientCredits);
            return;
        }

        try {
            const expiresAt = new Date();

            const campaignData = {
                campaign_type: campaignType,
                credits_per_action: currentCreditsPerAction,
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
            case 0:
                return campaignType !== null;
            case 1:
                if (campaignType === 'video') {
                    return verifiedVideoData !== null &&
                        formData.interaction_type &&
                        formData.interaction_type !== '' &&
                        formData.target_count > 0;
                }
                return formData.target_count > 0;
            case 2:
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
            <LoadingSpinner isVisible={true} />
        );
    }

    return (
        <Container size="lg">
            <Stack gap="xl">
                {/* Custom Stepper with Enhanced Design */}
                <Paper
                    p="xl"
                    radius="xl"
                    style={(theme) => ({
                        background: theme.white,
                        border: `2px solid ${theme.colors.gray[2]}`,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    })}
                >
                    <Stepper
                        active={currentStep}
                        color="pink"
                        size="lg"
                        radius="xl"
                        styles={(theme) => ({
                            step: {
                                backgroundColor: theme.white,
                                borderWidth: rem(3),
                                borderColor: theme.colors.gray[3],
                                transition: 'all 0.3s ease',
                                '&[dataCompleted]': {
                                    background: `linear-gradient(135deg, ${theme.colors.pink[6]} 0%, ${theme.colors.red[6]} 100%)`,
                                    borderColor: theme.colors.pink[6],
                                },
                                '&[dataProgress]': {
                                    background: `linear-gradient(135deg, ${theme.colors.pink[6]} 0%, ${theme.colors.red[6]} 100%)`,
                                    borderColor: theme.colors.pink[6],
                                },
                            },
                            stepIcon: {
                                fontSize: rem(20),
                                fontWeight: 600,
                            },
                            stepLabel: {
                                fontSize: rem(16),
                                fontWeight: 700,
                                color: theme.colors.gray[8],
                                marginTop: rem(8),
                            },
                            stepDescription: {
                                fontSize: rem(14),
                                fontWeight: 500,
                                color: theme.colors.gray[7],
                                marginTop: rem(4),
                            },
                        })}
                    >
                        {stepData.map((step, index) => (
                            <Stepper.Step
                                key={index}
                                label={step.label}
                                description={step.description}
                                icon={<step.icon size={20} />}
                                completedIcon={<IconCheck size={20} />}
                            />
                        ))}
                    </Stepper>
                </Paper>

                {/* Step Content */}
                <Paper
                    p="xl"
                    radius="xl"
                    style={(theme) => ({
                        background: theme.white,
                        border: `1px solid ${theme.colors.gray[2]}`,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        minHeight: rem(600),
                        overflow: 'visible',
                        position: 'relative',
                        zIndex: 1,
                    })}
                >
                    <Box pos="relative" style={{ overflow: 'visible' }}>
                        <AnimatePresence mode="wait">
                            {currentStep === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{ position: 'relative', zIndex: 10 }}
                                >
                                    <CampaignTypeSelector
                                        selectedType={campaignType}
                                        onTypeSelect={handleTypeSelect}
                                        actionCredits={actionCredits}
                                        translations={serverTranslations}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{ position: 'relative', zIndex: 10 }}
                                >
                                    <Stack gap="xl">
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
                                    </Stack>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{ position: 'relative', zIndex: 10 }}
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
                    </Box>
                </Paper>

                {/* Navigation Buttons */}
                <Paper
                    p="xl"
                    radius="xl"
                    style={(theme) => ({
                        borderTop: `2px solid ${theme.colors.gray[2]}`,
                        background: theme.white,
                        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        zIndex: 2,
                    })}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Flex justify="space-between" align="center">
                            <Button
                                leftSection={<IconArrowLeft size={20} />}
                                variant="outline"
                                size="lg"
                                radius="xl"
                                disabled={currentStep === 0}
                                onClick={handleBack}
                                color="gray"
                                styles={{
                                    root: {
                                        fontWeight: 600,
                                        padding: '12px 32px',
                                        border: '2px solid',
                                        transition: 'all 0.2s ease',
                                        '&:not(:disabled):hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                                        },
                                    },
                                }}
                            >
                                {serverTranslations.buttons.back}
                            </Button>

                            <Group gap="md">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    radius="xl"
                                    onClick={() => router.push('/campaigns')}
                                    color="gray"
                                    styles={{
                                        root: {
                                            fontWeight: 600,
                                            padding: '12px 32px',
                                            border: '2px solid',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                                            },
                                        },
                                    }}
                                >
                                    {serverTranslations.buttons.cancel}
                                </Button>

                                {currentStep < 2 ? (
                                    <Button
                                        rightSection={<IconSparkles size={20} />}
                                        size="lg"
                                        radius="xl"
                                        disabled={!canProceed()}
                                        onClick={handleNext}
                                        gradient={{ from: 'pink.6', to: 'red.6', deg: 135 }}
                                        variant="gradient"
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                padding: '12px 32px',
                                                transition: 'all 0.2s ease',
                                                '&:not(:disabled):hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(254, 44, 85, 0.4)',
                                                },
                                            },
                                        }}
                                    >
                                        {serverTranslations.buttons.next}
                                    </Button>
                                ) : (
                                    <Button
                                        rightSection={
                                            campaignLoading ?
                                                <Loader size="sm" color="white" /> :
                                                <IconSparkles size={20} />
                                        }
                                        size="lg"
                                        radius="xl"
                                        disabled={campaignLoading || profile != undefined && profile?.credits < totalCost}
                                        onClick={handleCreateCampaign}
                                        gradient={{ from: 'pink.6', to: 'red.6', deg: 135 }}
                                        variant="gradient"
                                        loading={campaignLoading}
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                padding: '12px 32px',
                                                transition: 'all 0.2s ease',
                                                '&:not(:disabled):hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(254, 44, 85, 0.4)',
                                                },
                                            },
                                        }}
                                    >
                                        {campaignLoading ?
                                            serverTranslations.buttons.creating :
                                            serverTranslations.buttons.create
                                        }
                                    </Button>
                                )}
                            </Group>
                        </Flex>
                    </motion.div>
                </Paper>
            </Stack>
        </Container>
    );
}