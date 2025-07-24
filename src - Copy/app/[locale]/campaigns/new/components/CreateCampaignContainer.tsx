// 2. Container Component: src/app / [locale] / campaigns / create / components / CreateCampaignContainer.tsx
import { Suspense } from 'react';
import CreateCampaignClient from './CreateCampaignClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// CreateCampaignContainer.tsx - Cập nhật ServerTranslations interface

// CreateCampaignContainer.tsx - Cập nhật ServerTranslations interface

// CreateCampaignContainer.tsx - Interface tương ứng

interface ServerTranslations {
    title: string;
    subtitle: string;
    steps: {
        selectType: string;
        configure: string;
        review: string;
    };
    campaignTypes: {
        video: {
            title: string;
            description: string;
            interactions: {
                view: string;
                like: string;
                comment: string;
            };
        };
        follow: {
            title: string;
            description: string;
        };
    };
    form: {
        videoUrl: string;
        videoUrlPlaceholder: string;
        interactionType: string;
        targetCount: string;
        totalCost: string;
        verifyVideo: string;
        videoVerification: string;
        confirm: string;
        verifying: string;
        success: string;
        creator: string;
        ready: string;
        durationDays: string;
        selectDuration: string;
        quickBoost: string;
        shortCampaign: string;
        standard: string;
        extended: string;
        maximumReach: string;
        currentBalance: string;
        balanceAfterCampaign: string;
        insufficientCredits: string;
        topUpCredits: string;
        targetCountPlaceholder: string;
        loadingCampaign: string;
        // Bỏ: insufficientCreditsDesc, targetInfo, followersTargetInfo
    };
    buttons: {
        next: string;
        back: string;
        verify: string;
        create: string;
        cancel: string;
        creating: string;
    };
    messages: {
        invalidUrl: string;
        verificationFailed: string;
        insufficientCredits: string;
        success: string;
    };
    review: {
        title: string;
        subtitle: string;
        campaignOverview: string;
        videoEngagementCampaign: string;
        followerGrowthCampaign: string;
        growFollowing: string;
        targetVideo: string;
        targetAccount: string;
        videoId: string;
        currentStats: string;
        views: string;
        likes: string;
        comments: string;
        shares: string;
        followers: string;
        following: string;
        targetInteraction: string;
        accountDescription: string;
        costBreakdown: string;
        calculationDetails: string;
        targetGoal: string;
        duration: string;
        daysToComplete: string;
        followersToReceive: string;
        currentBalance: string;
        balanceAfter: string;
        remainingCredits: string;
        sufficientBalance: string;
        insufficientCreditsWarning: string;
        campaignTerms: string;
        importantTerms: string;
        readyToLaunch: string;
        terms: {
            distributedToCommunity: string;
            creditsOnlyOnCompletion: string;
            pauseAnytime: string;
            unusedCreditsRefunded: string;
            realUsers: string;
            resultsVary: string;
        };
        // Bỏ: boostVideoWith, creditsPerAction, creditsToReceive, needMoreCredits, 
        // campaignStartsImmediately, withinDays, withinWeeks
    };
    campaigns: {
        status: {
            active: string;
            paused: string;
            completed: string;
            expired: string;
        };
        actions: {
            pause: string;
            resume: string;
            edit: string;
            delete: string;
            view: string;
        };
    };
}

interface CreateCampaignContainerProps {
    locale: string;
    serverTranslations: ServerTranslations;
}

export default function CreateCampaignContainer({ locale, serverTranslations }: CreateCampaignContainerProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#EE1D52] bg-clip-text text-transparent mb-4">
                        {serverTranslations.title}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {serverTranslations.subtitle}
                    </p>
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                    <CreateCampaignClient
                        locale={locale}
                        serverTranslations={serverTranslations}
                    />
                </Suspense>
            </div>
        </div>
    );
}
