// Enhanced Campaign Review Component with Improved Text Readability: src/app/[locale]/campaigns/create/components/CampaignReview.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Image,
  Card,
  Button,
  Alert,
  Center,
  Box,
  ActionIcon,
  ThemeIcon,
  NumberFormatter,
  Avatar,
  SimpleGrid,
  Divider
} from '@mantine/core';
import {
  IconVideo,
  IconUserPlus,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconCurrencyDollar,
  IconCircleCheck,
  IconExclamationCircle,
  IconSparkles,
  IconTarget,
  IconWallet,
  IconShare,
  IconRocket
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface CampaignReviewProps {
  campaignType: 'video' | 'follow';
  formData: any;
  verifiedVideoData: any;
  userProfile: any;
  totalCost: number;
  currentCreditsPerAction: number;
  translations: any;
}

export default function CampaignReview({
  campaignType,
  formData,
  verifiedVideoData,
  userProfile,
  totalCost,
  currentCreditsPerAction,
  translations
}: CampaignReviewProps) {

  const t = useTranslations('CreateCampaign');

  const getInteractionIcon = (type: string, size = 20) => {
    const iconProps = { size, style: { width: size, height: size } };
    switch (type) {
      case 'like':
        return <IconHeart {...iconProps} style={{ ...iconProps.style, color: '#FE2C55' }} />;
      case 'view':
        return <IconEye {...iconProps} style={{ ...iconProps.style, color: '#228BE6' }} />;
      case 'comment':
        return <IconMessageCircle {...iconProps} style={{ ...iconProps.style, color: '#51CF66' }} />;
      default:
        return <IconHeart {...iconProps} style={{ ...iconProps.style, color: '#FE2C55' }} />;
    }
  };

  const getInteractionColor = (type: string) => {
    const colors = {
      like: { color: 'pink', variant: 'light' as const },
      view: { color: 'blue', variant: 'light' as const },
      comment: { color: 'teal', variant: 'light' as const }
    };
    return colors[type as keyof typeof colors] || colors.like;
  };

  const formatCount = (count: number | string) => {
    const num = typeof count === 'string' ? parseInt(count) : count;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const isBalanceSufficient = userProfile?.credits >= totalCost;
  const remainingBalance = (userProfile?.credits || 0) - totalCost;

  return (
    <Container size="xl" py="xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="xl">
          {/* Header Section */}
          <Center>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Paper
                p="xl"
                radius="xl"
                withBorder
                style={{
                  background: 'linear-gradient(135deg, rgba(254, 44, 85, 0.08) 0%, rgba(238, 29, 82, 0.08) 100%)',
                  borderColor: 'rgba(254, 44, 85, 0.3)',
                  borderWidth: 2
                }}
              >
                <Group gap="lg" justify="center">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: '#FE2C55', to: '#EE1D52' }}
                  >
                    <IconSparkles size={28} />
                  </ThemeIcon>
                  <Stack gap={8} align="center">
                    <Title order={1} ta="center" c="dark" fw={700}>
                      {translations.review.title}
                    </Title>
                    <Text size="lg" c="gray.7" ta="center" maw={600} fw={500}>
                      {translations.review.subtitle}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </motion.div>
          </Center>

          {/* Campaign Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              p="xl"
              radius="xl"
              withBorder
              shadow="lg"
              style={{
                background: 'linear-gradient(135deg, white 0%, #f8f9fa 100%)',
                borderWidth: 2,
                borderColor: '#e9ecef'
              }}
            >
              {/* Campaign Type Header */}
              <Group justify="space-between" mb="xl">
                <Group gap="xl">
                  <ThemeIcon
                    size={72}
                    radius="xl"
                    variant="gradient"
                    gradient={campaignType === 'video'
                      ? { from: '#FE2C55', to: '#EE1D52' }
                      : { from: '#25F4EE', to: '#339AF0' }
                    }
                  >
                    {campaignType === 'video' ? (
                      <IconVideo size={36} />
                    ) : (
                      <IconUserPlus size={36} />
                    )}
                  </ThemeIcon>
                  <Stack gap="xs">
                    <Title order={2} fw={700} c="dark">
                      {campaignType === 'video'
                        ? translations.review.videoEngagementCampaign
                        : translations.review.followerGrowthCampaign
                      }
                    </Title>
                    <Text size="lg" c="gray.8" fw={500}>
                      {campaignType === 'video' && formData.interaction_type
                        ? t('review.boostVideoWith', { type: formData.interaction_type })
                        : campaignType === 'follow'
                          ? translations.review.growFollowing
                          : 'Please select interaction type'
                      }
                    </Text>
                  </Stack>
                </Group>
                <Badge
                  size="xl"
                  radius="xl"
                  variant="gradient"
                  gradient={campaignType === 'video'
                    ? { from: '#FE2C55', to: '#EE1D52' }
                    : { from: '#25F4EE', to: '#339AF0' }
                  }
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {currentCreditsPerAction} credits/{campaignType === 'video' ? formData.interaction_type : 'follow'}
                </Badge>
              </Group>

              {/* Video Campaign Details */}
              {campaignType === 'video' && verifiedVideoData && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card radius="xl" withBorder mb="xl" p="xl" style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                    <Group gap="md" mb="lg">
                      <IconVideo size={28} style={{ color: '#FE2C55' }} />
                      <Title order={3} fw={600} c="dark">{translations.review.targetVideo}</Title>
                    </Group>

                    <Group gap="xl" align="flex-start">
                      {/* Video Thumbnail */}
                      <Box pos="relative">
                        <Image
                          src={verifiedVideoData.url}
                          alt="Video thumbnail"
                          w={120}
                          h={120}
                          radius="xl"
                          style={{ cursor: 'pointer', border: '3px solid #e9ecef' }}
                        />
                        <ActionIcon
                          size="xl"
                          radius="xl"
                          variant="filled"
                          color="dark"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: 0.9
                          }}
                        >
                          <IconEye size={24} />
                        </ActionIcon>
                      </Box>

                      {/* Video Info */}
                      <Stack gap="lg" style={{ flex: 1 }}>
                        <Group>
                          <Text size="md" fw={600} c="gray.8">
                            {translations.review.creator}:
                          </Text>
                          <Badge
                            variant="gradient"
                            gradient={{ from: '#FE2C55', to: '#EE1D52' }}
                            size="lg"
                            radius="xl"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            @{verifiedVideoData.tiktokID}
                          </Badge>
                        </Group>

                        <Group>
                          <Text size="md" fw={600} c="gray.8">
                            {translations.review.videoId}:
                          </Text>
                          <Badge variant="filled" color="gray" size="lg" radius="md" ff="monospace" style={{ fontSize: '13px' }}>
                            {verifiedVideoData.videoID}
                          </Badge>
                        </Group>

                        {/* Current Stats */}
                        <SimpleGrid cols={4} spacing="md">
                          {[
                            {
                              label: translations.review.views,
                              value: formatCount(verifiedVideoData.playCount),
                              icon: IconEye,
                              color: 'blue'
                            },
                            {
                              label: translations.review.likes,
                              value: formatCount(verifiedVideoData.diggCount),
                              icon: IconHeart,
                              color: 'pink'
                            },
                            {
                              label: translations.review.comments,
                              value: formatCount(verifiedVideoData.commentCount),
                              icon: IconMessageCircle,
                              color: 'teal'
                            },
                            {
                              label: translations.review.shares,
                              value: formatCount(verifiedVideoData.shareCount),
                              icon: IconShare,
                              color: 'violet'
                            }
                          ].map((stat, index) => (
                            <Card key={stat.label} p="md" radius="lg" bg="gray.1" style={{ borderWidth: 1, borderColor: '#dee2e6' }}>
                              <Center>
                                <Stack gap={6} align="center">
                                  <ThemeIcon size="md" color={stat.color} variant="light">
                                    <stat.icon size={18} />
                                  </ThemeIcon>
                                  <Text size="md" fw={700} c="dark">
                                    {stat.value}
                                  </Text>
                                  <Text size="sm" c="gray.7" fw={500}>
                                    {stat.label}
                                  </Text>
                                </Stack>
                              </Center>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </Stack>
                    </Group>

                    <Divider my="lg" />

                    {/* Selected Interaction Type */}
                    <Paper p="lg" radius="xl" bg="gray.1" style={{ border: '2px solid #e9ecef' }}>
                      <Group justify="space-between">
                        <Group>
                          <Text size="md" fw={600} c="gray.8">
                            {translations.review.targetInteraction}:
                          </Text>
                          <Badge
                            size="lg"
                            radius="xl"
                            variant={getInteractionColor(formData.interaction_type).variant}
                            color={getInteractionColor(formData.interaction_type).color}
                            leftSection={getInteractionIcon(formData.interaction_type, 18)}
                            style={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            {formData.interaction_type}s
                          </Badge>
                        </Group>
                        <Stack gap={4} align="flex-end">
                          <Text size="sm" c="gray.7" fw={500}>
                            {t('review.creditsPerAction', { action: formData.interaction_type })}
                          </Text>
                          <Text size="xl" fw={700} c="#FE2C55">
                            {currentCreditsPerAction}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  </Card>
                </motion.div>
              )}

              {/* Follow Campaign Details */}
              {campaignType === 'follow' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Paper
                    p="xl"
                    radius="xl"
                    mb="xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 244, 238, 0.08) 0%, rgba(51, 154, 240, 0.08) 100%)',
                      border: '2px solid rgba(37, 244, 238, 0.3)'
                    }}
                  >
                    <Group gap="md" mb="lg">
                      <IconUserPlus size={28} style={{ color: '#25F4EE' }} />
                      <Title order={3} fw={600} c="dark">{translations.review.targetAccount}</Title>
                    </Group>

                    <Group gap="xl">
                      <Avatar
                        size={80}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: '#25F4EE', to: '#339AF0' }}
                      >
                        <IconUserPlus size={36} />
                      </Avatar>
                      <Stack gap="md" style={{ flex: 1 }}>
                        <Title order={3} c="dark" fw={600}>@{userProfile?.tiktok_username}</Title>
                        <Text c="gray.8" mb="md" size="md" fw={500}>
                          {translations.review.accountDescription}
                        </Text>
                        <Badge variant="filled" color="cyan" size="lg" radius="xl">
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {translations.review.creditsPerFollow}:
                            </Text>
                            <Text fw={700}>
                              {currentCreditsPerAction}
                            </Text>
                          </Group>
                        </Badge>
                      </Stack>
                    </Group>
                  </Paper>
                </motion.div>
              )}

              {/* Campaign Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
                  <Card p="xl" radius="xl" withBorder style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                    <Group gap="md" mb="md">
                      <ThemeIcon size="xl" color="blue" variant="light">
                        <IconCurrencyDollar size={28} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text size="sm" c="gray.7" fw={500}>
                          Credits per {formData.interaction_type || 'action'}
                        </Text>
                        <Title order={2} c="dark" fw={700}>
                          <NumberFormatter value={currentCreditsPerAction} thousandSeparator />
                        </Title>
                      </Stack>
                    </Group>
                    <Text size="sm" c="gray.6" fw={500}>
                      {translations.review.costForEachInteraction}
                    </Text>
                  </Card>

                  <Card p="xl" radius="xl" withBorder style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                    <Group gap="md" mb="md">
                      <ThemeIcon size="xl" color="teal" variant="light">
                        <IconTarget size={28} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text size="sm" fw={500} c="gray.7">
                          {translations.review.targetGoal}
                        </Text>
                        <Title order={2} c="dark" fw={700}>
                          <NumberFormatter value={formData.target_count} thousandSeparator />
                        </Title>
                      </Stack>
                    </Group>
                    <Text size="sm" c="gray.6" fw={500}>
                      {campaignType === 'video'
                        ? `${formData.interaction_type}s to receive`
                        : translations.review.followersToReceive
                      }
                    </Text>
                  </Card>

                  <Card p="xl" radius="xl" withBorder style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                    <Group gap="md" mb="md">
                      <ThemeIcon size="xl" color="grape" variant="light">
                        <IconWallet size={28} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text size="sm" fw={500} c="gray.7">
                          {translations.review.totalCampaignCost}
                        </Text>
                        <Title order={2} c="#FE2C55" fw={700}>
                          <NumberFormatter value={totalCost} thousandSeparator />
                        </Title>
                      </Stack>
                    </Group>
                    <Text size="sm" c="gray.6" fw={500}>
                      {translations.review.creditsRequiredToStart}
                    </Text>
                  </Card>
                </SimpleGrid>
              </motion.div>
            </Paper>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Paper
              p="xl"
              radius="xl"
              withBorder
              shadow="lg"
              style={{
                background: 'linear-gradient(135deg, white 0%, #f8f9fa 100%)',
                borderWidth: 2,
                borderColor: '#e9ecef'
              }}
            >
              <Group gap="md" mb="xl">
                <ThemeIcon
                  size="xl"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#FE2C55', to: '#EE1D52' }}
                >
                  <IconCurrencyDollar size={32} />
                </ThemeIcon>
                <Title order={2} fw={700} c="dark">{translations.review.costBreakdown}</Title>
              </Group>

              <Stack gap="xl">
                {/* Calculation Details */}
                <Card p="xl" radius="xl" withBorder style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                    <Center>
                      <Stack gap="xs" align="center">
                        <Text size="md" c="gray.7" fw={600}>
                          Credits per {formData.interaction_type || 'action'}
                        </Text>
                        <Title order={1} c="#FE2C55" fw={700}>
                          <NumberFormatter value={currentCreditsPerAction} thousandSeparator />
                        </Title>
                      </Stack>
                    </Center>
                    <Center>
                      <Stack gap="xs" align="center">
                        <Text size="md" fw={600} c="gray.7">
                          × {translations.review.targetGoal}
                        </Text>
                        <Title order={1} c="dark" fw={700}>
                          <NumberFormatter value={formData.target_count} thousandSeparator />
                        </Title>
                      </Stack>
                    </Center>
                    <Center>
                      <Stack gap="xs" align="center">
                        <Text size="md" fw={600} c="gray.7">
                          = {translations.review.totalCost}
                        </Text>
                        <Title order={1} c="dark" fw={700}>
                          <NumberFormatter value={totalCost} thousandSeparator />
                        </Title>
                      </Stack>
                    </Center>
                  </SimpleGrid>
                </Card>

                {/* Balance Information */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                  <Card
                    p="xl"
                    radius="xl"
                    withBorder
                    style={{
                      backgroundColor: isBalanceSufficient ? '#e6fffa' : '#fef2f2',
                      borderColor: isBalanceSufficient ? '#4fd1c7' : '#fca5a5',
                      borderWidth: 2
                    }}
                  >
                    <Group gap="md" mb="md">
                      <ThemeIcon
                        size="xl"
                        color={isBalanceSufficient ? 'teal' : 'red'}
                        variant="light"
                      >
                        {isBalanceSufficient ? (
                          <IconCircleCheck size={28} />
                        ) : (
                          <IconExclamationCircle size={28} />
                        )}
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text size="md" fw={600} c="gray.8">
                          {translations.review.currentBalance}
                        </Text>
                        <Title
                          order={2}
                          c={isBalanceSufficient ? 'teal.8' : 'red.8'}
                          fw={700}
                        >
                          <NumberFormatter value={userProfile?.credits || 0} thousandSeparator />
                        </Title>
                      </Stack>
                    </Group>
                    <Text
                      size="md"
                      c={isBalanceSufficient ? 'teal.8' : 'red.8'}
                      fw={600}
                    >
                      {isBalanceSufficient ? translations.review.sufficientBalance : translations.review.insufficientCreditsWarning}
                    </Text>
                  </Card>

                  <Card p="xl" radius="xl" withBorder bg="gray.1" style={{ borderWidth: 2, borderColor: '#e9ecef' }}>
                    <Group gap="md" mb="md">
                      <ThemeIcon size="xl" color="gray" variant="light">
                        <IconWallet size={28} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text size="md" fw={600} c="gray.8">
                          {translations.review.balanceAfter}
                        </Text>
                        <Title
                          order={2}
                          c={remainingBalance >= 0 ? 'dark' : 'red'}
                          fw={700}
                        >
                          <NumberFormatter value={remainingBalance} thousandSeparator />
                        </Title>
                      </Stack>
                    </Group>
                    <Text size="md" c="gray.7" fw={500}>
                      {translations.review.remainingCredits}
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* Insufficient Credits Warning */}
                {!isBalanceSufficient && (
                  <motion.div>
                    <Alert
                      icon={<IconExclamationCircle size={28} />}
                      title={<Text fw={600}>{t('form.insufficientCredits')}</Text>}
                      color="red"
                      radius="xl"
                      variant="light"
                      style={{ borderWidth: 2 }}
                    >
                      <Stack gap="md">
                        <Text size="md" fw={500}>
                          {t('review.needMoreCredits', {
                            amount: (totalCost - (userProfile?.credits || 0)).toLocaleString()
                          })}
                        </Text>
                        <Button
                          variant="gradient"
                          gradient={{ from: 'red', to: 'pink' }}
                          radius="xl"
                          size="lg"
                          fw={600}
                          leftSection={<IconCurrencyDollar size={20} />}
                        >
                          {t('form.topUpCredits')}
                        </Button>
                      </Stack>
                    </Alert>
                  </motion.div>
                )}
              </Stack>
            </Paper>
          </motion.div>

          {/* Terms and Launch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Paper
              p="xl"
              radius="xl"
              withBorder
              shadow="lg"
              style={{
                background: 'linear-gradient(135deg, white 0%, #f8f9fa 100%)',
                borderWidth: 2,
                borderColor: '#e9ecef'
              }}
            >
              <Title order={2} mb="xl" fw={700} c="dark">
                {translations.review.campaignTerms}
              </Title>

              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
                {/* Terms */}
                <Stack gap="lg">
                  <Title order={3} mb="md" c="dark" fw={600}>
                    {translations.review.importantTerms}
                  </Title>
                  <Stack gap="md">
                    {[
                      translations.review.terms.distributedToCommunity,
                      translations.review.terms.creditsOnlyOnCompletion,
                      translations.review.terms.pauseAnytime,
                      translations.review.terms.unusedCreditsRefunded,
                      translations.review.terms.realUsers,
                      translations.review.terms.resultsVary
                    ].map((term, index) => (
                      <Group key={index} gap="sm" align="flex-start">
                        <ThemeIcon size="md" color="teal" variant="light" mt={2}>
                          <IconCircleCheck size={18} />
                        </ThemeIcon>
                        <Text size="md" c="gray.8" style={{ flex: 1 }} fw={500}>
                          {term}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>

                {/* Launch Confirmation */}
                <Paper
                  p="xl"
                  radius="xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(254, 44, 85, 0.08) 0%, rgba(238, 29, 82, 0.08) 100%)',
                    border: '3px solid rgba(254, 44, 85, 0.3)'
                  }}
                >
                  <Center>
                    <Stack gap="lg" align="center">
                      <ThemeIcon
                        size={80}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: '#FE2C55', to: '#EE1D52' }}
                      >
                        <IconRocket size={40} />
                      </ThemeIcon>
                      <Title order={3} ta="center" c="dark" fw={700}>
                        {translations.review.readyToLaunch}
                      </Title>
                      <Text c="gray.8" ta="center" fw={500} size="md">
                        {t('review.campaignStartsImmediately', {
                          type: campaignType === 'video' ? formData.interaction_type + 's' : 'followers'
                        })}
                      </Text>
                    </Stack>
                  </Center>
                </Paper>
              </SimpleGrid>
            </Paper>
          </motion.div>
        </Stack>
      </motion.div>
    </Container>
  );
}