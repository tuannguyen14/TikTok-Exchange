'use client';

import { useEffect, useCallback, useMemo } from 'react';
import {
    Paper,
    Group,
    Avatar,
    Text,
    Badge,
    Stack,
    Button,
    NumberInput,
    Card,
    Grid,
    Alert,
    Divider,
    Box,
    ThemeIcon,
    rem,
    Flex,
    Title,
    ActionIcon,
} from '@mantine/core';
import {
    IconHeart,
    IconEye,
    IconMessageCircle,
    IconUserPlus,
    IconCurrencyDollar,
    IconCheck,
    IconAlertTriangle,
    IconSparkles,
    IconTrendingUp
} from '@tabler/icons-react';
import { ActionCreditsAPI } from '@/lib/api/actionCredits';
import { useTranslations } from 'next-intl';
import classes from './CampaignConfigForm.module.css';
import { useProfile } from '@/hooks/useProfile';

interface CampaignConfigFormProps {
    campaignType: 'video' | 'follow';
    formData: any;
    onChange: (field: string, value: any) => void;
    userProfile: any;
    actionCredits: any[];
    translations: any;
}

export default function CampaignConfigForm({
    campaignType,
    formData,
    onChange,
    userProfile,
    actionCredits,
    translations
}: CampaignConfigFormProps) {
    const t = useTranslations('CreateCampaign');
    const actionCreditsAPI = useMemo(() => new ActionCreditsAPI(), []);
    const { tiktokAvatar, loading: profileLoading } = useProfile()


    const getCreditValue = useCallback((actionType: string) => {
        return actionCreditsAPI.getCreditValue(actionType, actionCredits);
    }, [actionCreditsAPI, actionCredits]);

    const interactionOptions = [
        {
            type: 'view',
            icon: IconEye,
            label: translations.campaignTypes.video.interactions.view,
            color: 'blue',
            credits: getCreditValue('view'),
            gradient: { from: 'blue', to: 'cyan' }
        },
        {
            type: 'like',
            icon: IconHeart,
            label: translations.campaignTypes.video.interactions.like,
            color: 'pink',
            credits: getCreditValue('like'),
            gradient: { from: 'pink', to: 'red' }
        },
        {
            type: 'comment',
            icon: IconMessageCircle,
            label: translations.campaignTypes.video.interactions.comment,
            color: 'teal',
            credits: getCreditValue('comment'),
            gradient: { from: 'teal', to: 'green' }
        }
    ];

    const currentCreditsPerAction = campaignType === 'follow'
        ? getCreditValue('follow')
        : (formData.interaction_type ? getCreditValue(formData.interaction_type) : 0);

    const totalCost = currentCreditsPerAction * formData.target_count;
    const hasInsufficientCredits = userProfile?.credits < totalCost;

    useEffect(() => {
        if (campaignType === 'video' && formData.interaction_type && formData.interaction_type !== 'follow') {
            const credits = getCreditValue(formData.interaction_type);
            onChange('credits_per_action', credits);
        } else if (campaignType === 'follow') {
            const credits = getCreditValue('follow');
            onChange('credits_per_action', credits);

            if (formData.interaction_type !== 'follow') {
                onChange('interaction_type', 'follow');
            }
        }
    }, [formData.interaction_type, campaignType, actionCredits, getCreditValue, onChange]);

    return (
        <Stack gap="xl">
            {/* Follow Campaign - Target Profile Card */}
            {campaignType === 'follow' && !profileLoading && tiktokAvatar && (
                <Card
                    shadow="lg"
                    radius="xl"
                    p="xl"
                    className={classes.profileCard}
                    style={{
                        background: 'linear-gradient(135deg, rgba(37, 244, 238, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                        border: '2px solid rgba(37, 244, 238, 0.2)'
                    }}
                >
                    <Group gap="xl" align="center">
                        <Box pos="relative">
                            <Avatar
                                src={tiktokAvatar}
                                alt={userProfile?.tiktok_username}
                                size={80}
                                radius="lg"
                                className={classes.profileAvatar}
                            />
                            <ThemeIcon
                                size={32}
                                radius="xl"
                                gradient={{ from: 'cyan', to: 'blue' }}
                                pos="absolute"
                                bottom={-8}
                                right={-8}
                                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                            >
                                <IconUserPlus size={18} />
                            </ThemeIcon>
                        </Box>

                        <Stack gap="xs" flex={1}>
                            <Text size="xl" fw={700} c="dark">
                                @{userProfile?.tiktok_username}
                            </Text>
                        </Stack>

                        <Group gap="xl">
                            <Badge
                                size="lg"
                                radius="xl"
                                gradient={{ from: 'cyan', to: 'blue' }}
                                variant="gradient"
                                style={{ padding: '12px 16px' }}
                            >
                                <Group gap={4}>
                                    <IconSparkles size={16} />
                                    <Text fw={700}>
                                        {getCreditValue('follow')} {translations.form.creditsPerFollow}
                                    </Text>
                                </Group>
                            </Badge>
                        </Group>
                    </Group>
                </Card>
            )}

            {/* Interaction Type Selection (Video only) */}
            {campaignType === 'video' && (
                <Box>
                    <Group gap="md" mb="lg">
                        <ThemeIcon size={32} radius="lg" gradient={{ from: 'pink', to: 'red' }}>
                            <Text size="sm" fw={700} c="white">1</Text>
                        </ThemeIcon>
                        <Title order={3} c="dark">
                            {translations.form.interactionType}
                        </Title>
                    </Group>

                    <Grid>
                        {interactionOptions.map((option) => {
                            const isSelected = formData.interaction_type === option.type;
                            const isDisabled = option.type === 'view' || option.type === 'comment';

                            return (
                                <Grid.Col key={option.type} span={{ base: 12, md: 4 }}>
                                    <Card
                                        shadow={isSelected ? "lg" : "sm"}
                                        radius="xl"
                                        p="lg"
                                        className={`${classes.interactionCard} ${isSelected ? classes.selected : ''
                                            } ${isDisabled ? classes.disabled : ''}`}
                                        onClick={() => !isDisabled && onChange('interaction_type', option.type)}
                                        style={{
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            opacity: isDisabled ? 0.5 : 1,
                                            border: isSelected ? '2px solid var(--mantine-color-blue-4)' : '2px solid transparent',
                                            transform: isSelected ? 'translateY(-2px)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Stack align="center" gap="md">
                                            <ThemeIcon
                                                size={48}
                                                radius="xl"
                                                variant="light"
                                                color={option.color}
                                            >
                                                <option.icon size={24} />
                                            </ThemeIcon>

                                            <Box ta="center">
                                                <Text fw={700} size="md" c="dark">
                                                    {option.label}
                                                </Text>
                                                <Text size="sm" c="dimmed" mt={4}>
                                                    <Text component="span" fw={600} c={option.color}>
                                                        {option.credits} credits
                                                    </Text>{' '}
                                                    each
                                                </Text>
                                                {isDisabled && (
                                                    <Text size="xs" c="dimmed" fs="italic" mt={8}>
                                                        Tính năng đang khóa
                                                    </Text>
                                                )}
                                            </Box>
                                        </Stack>

                                        {isSelected && !isDisabled && (
                                            <ActionIcon
                                                size={24}
                                                radius="xl"
                                                gradient={{ from: 'pink', to: 'red' }}
                                                variant="gradient"
                                                pos="absolute"
                                                top={12}
                                                right={12}
                                            >
                                                <IconCheck size={14} />
                                            </ActionIcon>
                                        )}
                                    </Card>
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Target Count Input */}
            <Box>
                <Group gap="md" mb="lg">
                    <ThemeIcon size={32} radius="lg" gradient={{ from: 'pink', to: 'red' }}>
                        <Text size="sm" fw={700} c="white">2</Text>
                    </ThemeIcon>
                    <Title order={3} c="dark">
                        {translations.form.targetCount}
                    </Title>
                </Group>

                <NumberInput
                    size="lg"
                    radius="xl"
                    min={1}
                    max={10000}
                    value={formData.target_count}
                    onChange={(value) => onChange('target_count', value || 0)}
                    placeholder={translations.form.targetCountPlaceholder}
                    rightSection={
                        <Text size="sm" fw={500} c="dimmed" pr="md" mr="xl">
                            {campaignType === 'video'
                                ? `${formData.interaction_type}s`
                                : 'followers'
                            }
                        </Text>
                    }
                    styles={{
                        input: {
                            fontSize: rem(18),
                            fontWeight: 600,
                            paddingRight: rem(120)
                        }
                    }}
                />

                <Alert
                    icon={<IconSparkles size={16} />}
                    color="blue"
                    variant="light"
                    radius="lg"
                    mt="md"
                >
                    <Text size="sm">
                        💡 {campaignType === 'video'
                            ? t('form.targetInfo', { type: formData.interaction_type })
                            : t('form.followersTargetInfo')
                        }
                    </Text>
                </Alert>
            </Box>

            {/* Cost Summary */}
            <Card shadow="lg" radius="xl" p="xl" className={classes.costCard}>
                <Group gap="md" mb="lg">
                    <ThemeIcon size={40} radius="xl" gradient={{ from: 'pink', to: 'red' }}>
                        <IconCurrencyDollar size={20} />
                    </ThemeIcon>
                    <Title order={3} c="dark">
                        {translations.form.totalCost}
                    </Title>
                </Group>

                <Grid mb="lg">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="md" radius="lg" bg="gray.0" className={classes.statCard}>
                            <Text size="sm" c="dimmed" mb={4}>
                                {t('review.creditsPerAction', { action: formData.interaction_type })}
                            </Text>
                            <Text size="xl" fw={700} c="dark">
                                {currentCreditsPerAction}
                            </Text>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="md" radius="lg" bg="gray.0" className={classes.statCard}>
                            <Text size="sm" c="dimmed" mb={4}>
                                {translations.form.targetCount}
                            </Text>
                            <Text size="xl" fw={700} c="dark">
                                {formData.target_count.toLocaleString()}
                            </Text>
                        </Paper>
                    </Grid.Col>
                </Grid>

                <Divider mb="lg" />

                <Stack gap="md">
                    <Flex justify="space-between" align="center">
                        <Text size="lg" fw={600} c="dark">
                            {translations.form.totalCost}:
                        </Text>
                        <Text
                            size="xl"
                            fw={700}
                            gradient={{ from: 'pink', to: 'red' }}
                            variant="gradient"
                        >
                            {totalCost.toLocaleString()} credits
                        </Text>
                    </Flex>

                    <Flex justify="space-between" align="center">
                        <Text fw={500} c="dimmed">
                            {translations.form.currentBalance}:
                        </Text>
                        <Text
                            fw={700}
                            size="lg"
                            c={userProfile?.credits >= totalCost ? 'teal' : 'red'}
                        >
                            {userProfile?.credits?.toLocaleString() || 0} credits
                        </Text>
                    </Flex>

                    {userProfile?.credits >= totalCost && (
                        <>
                            <Divider size="sm" />
                            <Flex justify="space-between" align="center">
                                <Text fw={500} c="dimmed">
                                    {translations.form.balanceAfterCampaign}:
                                </Text>
                                <Text fw={700} size="lg" c="dark">
                                    {((userProfile?.credits || 0) - totalCost).toLocaleString()} credits
                                </Text>
                            </Flex>
                        </>
                    )}
                </Stack>
            </Card>

            {/* Insufficient Credits Warning */}
            {hasInsufficientCredits && (
                <Alert
                    icon={<IconAlertTriangle size={20} />}
                    color="red"
                    variant="light"
                    radius="xl"
                    p="xl"
                    className={classes.warningAlert}
                >
                    <Stack gap="md">
                        <Box>
                            <Text fw={700} size="lg" c="red.7" mb={4}>
                                {t('form.insufficientCredits')}
                            </Text>
                            <Text c="red.6" fw={500}>
                                {t('form.insufficientCreditsDesc', {
                                    amount: (totalCost - (userProfile?.credits || 0)).toLocaleString()
                                })}
                            </Text>
                        </Box>
                        <Button
                            gradient={{ from: 'red', to: 'pink' }}
                            radius="lg"
                            size="md"
                            leftSection={<IconTrendingUp size={18} />}
                            variant="gradient"
                            w="fit-content"
                        >
                            {t('form.topUpCredits')}
                        </Button>
                    </Stack>
                </Alert>
            )}
        </Stack>
    );
}