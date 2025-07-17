// 2. Container Component: src/app / [locale] / campaigns / create / components / CreateCampaignContainer.tsx
import { Suspense } from 'react';
import CreateCampaignClient from './CreateCampaignClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
        creditsPerAction: string;
        targetCount: string;
        duration: string;
        totalCost: string;
        verifyVideo: string;
        videoVerification: string;
        confirm: string;
    };
    buttons: {
        next: string;
        back: string;
        verify: string;
        create: string;
        cancel: string;
    };
    messages: {
        invalidUrl: string;
        verificationFailed: string;
        insufficientCredits: string;
        success: string;
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
