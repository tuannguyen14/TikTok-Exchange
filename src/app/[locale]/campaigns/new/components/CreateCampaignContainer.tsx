// CreateCampaignContainer.tsx với Mantine V8
import { Suspense } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Box,
    Paper,
    Loader,
    Center,
    Group
} from '@mantine/core';
import CreateCampaignClient from './CreateCampaignClient';

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

// Loading fallback component
function LoadingFallback() {
    return (
        <Paper
            shadow="sm"
            radius="lg"
            p="xl"
            style={{
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Center>
                <Stack align="center" gap="md">
                    <Loader size="lg" color="#FE2C55" />
                    <Text size="sm" c="dimmed">
                        Loading campaign creator...
                    </Text>
                </Stack>
            </Center>
        </Paper>
    );
}

export default function CreateCampaignContainer({
    locale,
    serverTranslations
}: CreateCampaignContainerProps) {
    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%)',
            }}
        >
            <Container size="lg" py="xl">
                {/* Header Section */}
                <Paper
                    radius="xl"
                    p="xl"
                    mb="xl"
                    style={{
                        background: 'linear-gradient(135deg, #FE2C55 0%, #EE1D52 100%)',
                        color: 'white',
                        textAlign: 'center',
                        border: 'none',
                    }}
                >
                    <Stack gap="md" align="center">
                        <Title
                            order={1}
                            size="h1"
                            fw={700}
                            style={{
                                fontSize: '2.5rem',
                                lineHeight: 1.2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {serverTranslations.title}
                        </Title>
                        <Text
                            size="lg"
                            style={{
                                opacity: 0.9,
                                maxWidth: '600px',
                                lineHeight: 1.5
                            }}
                        >
                            {serverTranslations.subtitle}
                        </Text>
                    </Stack>
                </Paper>

                {/* Main Content */}
                <Paper
                    shadow="lg"
                    radius="xl"
                    p="xl"
                    style={{
                        background: 'white',
                        border: '1px solid #f1f3f4',
                        overflow: 'hidden'
                    }}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <CreateCampaignClient
                            locale={locale}
                            serverTranslations={serverTranslations}
                        />
                    </Suspense>
                </Paper>

                {/* Footer spacing */}
                <Box h="xl" />
            </Container>
        </Box>
    );
}