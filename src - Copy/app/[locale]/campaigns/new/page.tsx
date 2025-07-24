// 1. Main Create Campaign Page: src/app/[locale]/campaigns/create/page.tsx
'use server';

import { getTranslations } from 'next-intl/server';
import CreateCampaignContainer from './components/CreateCampaignContainer';

// page.tsx - Sửa lại để load cả 2 namespaces

// page.tsx - ServerTranslations clean, không có ICU format

export default async function CreateCampaignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const tCreate = await getTranslations({ locale, namespace: 'CreateCampaign' });
    const tCampaigns = await getTranslations({ locale, namespace: 'Campaigns' });

    const serverTranslations = {
        title: tCreate('title'),
        subtitle: tCreate('subtitle'),
        steps: {
            selectType: tCreate('steps.selectType'),
            configure: tCreate('steps.configure'),
            review: tCreate('steps.review'),
        },
        campaignTypes: {
            video: {
                title: tCreate('campaignTypes.video.title'),
                description: tCreate('campaignTypes.video.description'),
                interactions: {
                    view: tCreate('campaignTypes.video.interactions.view'),
                    like: tCreate('campaignTypes.video.interactions.like'),
                    comment: tCreate('campaignTypes.video.interactions.comment'),
                }
            },
            follow: {
                title: tCreate('campaignTypes.follow.title'),
                description: tCreate('campaignTypes.follow.description'),
            }
        },
        form: {
            videoUrl: tCreate('form.videoUrl'),
            videoUrlPlaceholder: tCreate('form.videoUrlPlaceholder'),
            interactionType: tCreate('form.interactionType'),
            targetCount: tCreate('form.targetCount'),
            totalCost: tCreate('form.totalCost'),
            verifyVideo: tCreate('form.verifyVideo'),
            videoVerification: tCreate('form.videoVerification'),
            confirm: tCreate('form.confirm'),
            verifying: tCreate('form.verifying'),
            success: tCreate('form.success'),
            creator: tCreate('form.creator'),
            ready: tCreate('form.ready'),
            durationDays: tCreate('form.durationDays'),
            selectDuration: tCreate('form.selectDuration'),
            quickBoost: tCreate('form.quickBoost'),
            shortCampaign: tCreate('form.shortCampaign'),
            standard: tCreate('form.standard'),
            extended: tCreate('form.extended'),
            maximumReach: tCreate('form.maximumReach'),
            currentBalance: tCreate('form.currentBalance'),
            balanceAfterCampaign: tCreate('form.balanceAfterCampaign'),
            insufficientCredits: tCreate('form.insufficientCredits'),
            topUpCredits: tCreate('form.topUpCredits'),
            targetCountPlaceholder: tCreate('form.targetCountPlaceholder'),
            loadingCampaign: tCreate('form.loadingCampaign'),
            // Bỏ các ICU format: insufficientCreditsDesc, targetInfo, followersTargetInfo
        },
        buttons: {
            next: tCreate('buttons.next'),
            back: tCreate('buttons.back'),
            verify: tCreate('buttons.verify'),
            create: tCreate('buttons.create'),
            cancel: tCreate('buttons.cancel'),
            creating: tCreate('buttons.creating'),
        },
        messages: {
            invalidUrl: tCreate('messages.invalidUrl'),
            verificationFailed: tCreate('messages.verificationFailed'),
            insufficientCredits: tCreate('messages.insufficientCredits'),
            success: tCreate('messages.success'),
        },
        review: {
            title: tCreate('review.title'),
            subtitle: tCreate('review.subtitle'),
            campaignOverview: tCreate('review.campaignOverview'),
            videoEngagementCampaign: tCreate('review.videoEngagementCampaign'),
            followerGrowthCampaign: tCreate('review.followerGrowthCampaign'),
            growFollowing: tCreate('review.growFollowing'),
            targetVideo: tCreate('review.targetVideo'),
            targetAccount: tCreate('review.targetAccount'),
            videoId: tCreate('review.videoId'),
            currentStats: tCreate('review.currentStats'),
            views: tCreate('review.views'),
            likes: tCreate('review.likes'),
            comments: tCreate('review.comments'),
            shares: tCreate('review.shares'),
            followers: tCreate('review.followers'),
            following: tCreate('review.following'),
            targetInteraction: tCreate('review.targetInteraction'),
            accountDescription: tCreate('review.accountDescription'),
            costBreakdown: tCreate('review.costBreakdown'),
            calculationDetails: tCreate('review.calculationDetails'),
            targetGoal: tCreate('review.targetGoal'),
            duration: tCreate('review.duration'),
            daysToComplete: tCreate('review.daysToComplete'),
            followersToReceive: tCreate('review.followersToReceive'),
            currentBalance: tCreate('review.currentBalance'),
            balanceAfter: tCreate('review.balanceAfter'),
            remainingCredits: tCreate('review.remainingCredits'),
            sufficientBalance: tCreate('review.sufficientBalance'),
            insufficientCreditsWarning: tCreate('review.insufficientCreditsWarning'),
            campaignTerms: tCreate('review.campaignTerms'),
            importantTerms: tCreate('review.importantTerms'),
            readyToLaunch: tCreate('review.readyToLaunch'),
            terms: {
                distributedToCommunity: tCreate('review.terms.distributedToCommunity'),
                creditsOnlyOnCompletion: tCreate('review.terms.creditsOnlyOnCompletion'),
                pauseAnytime: tCreate('review.terms.pauseAnytime'),
                unusedCreditsRefunded: tCreate('review.terms.unusedCreditsRefunded'),
                realUsers: tCreate('review.terms.realUsers'),
                resultsVary: tCreate('review.terms.resultsVary'),
            }
            // Bỏ các ICU format: boostVideoWith, creditsPerAction, creditsToReceive, 
            // needMoreCredits, campaignStartsImmediately, withinDays, withinWeeks
        },
        campaigns: {
            status: {
                active: tCampaigns('status.active'),
                paused: tCampaigns('status.paused'),
                completed: tCampaigns('status.completed'),
                expired: tCampaigns('status.expired'),
            },
            actions: {
                pause: tCampaigns('actions.pause'),
                resume: tCampaigns('actions.resume'),
                edit: tCampaigns('actions.edit'),
                delete: tCampaigns('actions.delete'),
                view: tCampaigns('actions.view'),
            }
        }
    };

    return (
        <CreateCampaignContainer
            locale={locale}
            serverTranslations={serverTranslations}
        />
    );
}