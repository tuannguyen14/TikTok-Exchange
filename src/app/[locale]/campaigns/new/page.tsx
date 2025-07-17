// 1. Main Create Campaign Page: src/app/[locale]/campaigns/create/page.tsx
'use server';

import { getTranslations } from 'next-intl/server';
import CreateCampaignContainer from './components/CreateCampaignContainer';

export default async function CreateCampaignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: 'CreateCampaign' });

    const serverTranslations = {
        title: t('title'),
        subtitle: t('subtitle'),
        steps: {
            selectType: t('steps.selectType'),
            configure: t('steps.configure'),
            review: t('steps.review'),
        },
        campaignTypes: {
            video: {
                title: t('campaignTypes.video.title'),
                description: t('campaignTypes.video.description'),
                interactions: {
                    view: t('campaignTypes.video.interactions.view'),
                    like: t('campaignTypes.video.interactions.like'),
                    comment: t('campaignTypes.video.interactions.comment'),
                }
            },
            follow: {
                title: t('campaignTypes.follow.title'),
                description: t('campaignTypes.follow.description'),
            }
        },
        form: {
            videoUrl: t('form.videoUrl'),
            videoUrlPlaceholder: t('form.videoUrlPlaceholder'),
            interactionType: t('form.interactionType'),
            creditsPerAction: t('form.creditsPerAction'),
            targetCount: t('form.targetCount'),
            duration: t('form.duration'),
            totalCost: t('form.totalCost'),
            verifyVideo: t('form.verifyVideo'),
            videoVerification: t('form.videoVerification'),
            confirm: t('form.confirm'),
        },
        buttons: {
            next: t('buttons.next'),
            back: t('buttons.back'),
            verify: t('buttons.verify'),
            create: t('buttons.create'),
            cancel: t('buttons.cancel'),
        },
        messages: {
            invalidUrl: t('messages.invalidUrl'),
            verificationFailed: t('messages.verificationFailed'),
            insufficientCredits: t('messages.insufficientCredits'),
            success: t('messages.success'),
        }
    };

    return (
        <CreateCampaignContainer
            locale={locale}
            serverTranslations={serverTranslations}
        />
    );
}