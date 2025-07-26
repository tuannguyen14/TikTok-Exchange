'use client';

import { useState } from 'react';
import {
  TextInput,
  Button,
  Alert,
  Card,
  Group,
  Stack,
  Text,
  Avatar,
  Badge,
  Paper,
  Image,
  ActionIcon,
  Box,
  Flex,
  Center,
  SimpleGrid
} from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconLink,
  IconCheck,
  IconAlertCircle,
  IconEye,
  IconPlayerPlay,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconCheckbox
} from '@tabler/icons-react';
import { useTikTokApi } from '@/hooks/useTikTok';
import { validateTikTokURL } from '@/lib/utils/validate-video-url';

interface VideoUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onVideoVerified: (videoData: any) => void;
  translations: any;
}

export default function VideoUrlInput({
  value,
  onChange,
  onVideoVerified,
  translations
}: VideoUrlInputProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const { getPostDetail } = useTikTokApi();

  const handleVerify = async () => {
    const validateResult = validateTikTokURL(value);
    if (!validateResult.isValid) {
      setError(translations.messages.invalidUrl);
      return;
    }
    setIsVerifying(true);
    setError('');

    if (!validateResult.videoId) {
      setError(translations.messages.invalidUrl);
      return;
    }

    try {
      const url = `https://www.tiktok.com/@${validateResult.username}/video/${validateResult.videoId}`;
      const result = await getPostDetail(url);

      if (result.success && result.data) {
        const postDetail = result.data;
        if (postDetail) {
          const transformedData = {
            collectCount: postDetail.collectCount,
            commentCount: postDetail.commentCount,
            diggCount: postDetail.diggCount,
            playCount: postDetail.playCount,
            shareCount: postDetail.shareCount,
            tiktokID: postDetail.tiktokID,
            url: postDetail.url,
            videoID: postDetail.videoID
          };

          setVerificationResult(transformedData);
          onVideoVerified(transformedData);
        } else {
          setError(translations.messages.verificationFailed);
          setVerificationResult(null);
        }
      } else {
        setError(result.error || translations.messages.verificationFailed);
        setVerificationResult(null);
      }
    } catch (err) {
      setError(translations.messages.verificationFailed);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <Stack gap="xl">
      {/* URL Input Section */}
      <Stack gap="md">
        <Text size="lg" fw={600} c="dark">
          {translations.form.videoUrl}
        </Text>
        
        <Group gap={0} grow>
          <TextInput
            size="lg"
            placeholder={translations.form.videoUrlPlaceholder}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            leftSection={<IconLink size={20} />}
            styles={{
              input: {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: 'none',
                '&:focus': {
                  borderColor: '#FE2C55',
                  boxShadow: '0 0 0 2px rgba(254, 44, 85, 0.2)'
                }
              }
            }}
          />
          <Button
            size="lg"
            onClick={handleVerify}
            loading={isVerifying}
            disabled={!value.trim()}
            variant="gradient"
            gradient={{ from: '#FE2C55', to: '#EE1D52' }}
            leftSection={!isVerifying && <IconEye size={16} />}
            styles={{
              root: {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }
            }}
          >
            {isVerifying ? translations.form.verifying : translations.buttons.verify}
          </Button>
        </Group>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              radius="md"
            >
              {error}
            </Alert>
          </motion.div>
        )}
      </Stack>

      {/* Verification Result */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card
              shadow="xl"
              radius="xl"
              padding="xl"
              withBorder
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderColor: '#51cf66'
              }}
            >
              {/* Header */}
              <Group gap="md" mb="xl">
                <ActionIcon
                  size="xl"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'lime' }}
                >
                  <IconCheck size={24} />
                </ActionIcon>
                <div>
                  <Text size="xl" fw={700} c="dark">
                    {translations.form.videoVerification}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {translations.form.success}
                  </Text>
                </div>
              </Group>

              {/* Video Content */}
              <Flex
                direction={{ base: 'column', lg: 'row' }}
                gap="xl"
                align="flex-start"
              >
                {/* Video Thumbnail */}
                <Box style={{ position: 'relative', flexShrink: 0 }}>
                  <Paper
                    radius="xl"
                    shadow="lg"
                    style={{
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Image
                      src={verificationResult.url}
                      alt="Video thumbnail"
                      w={128}
                      h={160}
                      fit="cover"
                    />
                    <Center
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <ActionIcon size="xl" variant="light" c="white" radius="xl">
                        <IconPlayerPlay size={32} />
                      </ActionIcon>
                    </Center>
                  </Paper>
                  
                  {/* Duration Badge */}
                  <Badge
                    size="sm"
                    c="white"
                    bg="dark"
                    radius="md"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8
                    }}
                  >
                    {formatDuration(verificationResult.video?.duration || 0)}
                  </Badge>
                </Box>

                {/* Video Info */}
                <Stack gap="md" style={{ flex: 1 }}>
                  {/* Author Info */}
                  <Group gap="md">
                    <Avatar
                      src={verificationResult.author?.avatarThumb}
                      size="lg"
                      radius="xl"
                    />
                    <div>
                      <Group gap="xs">
                        <Text fw={700} c="dark">
                          {verificationResult.author?.nickname || verificationResult.tiktokID}
                        </Text>
                        {verificationResult.author?.verified && (
                          <ActionIcon size="sm" c="white" bg="blue" radius="xl">
                            <IconCheckbox size={12} />
                          </ActionIcon>
                        )}
                      </Group>
                      <Badge
                        variant="gradient"
                        gradient={{ from: '#FE2C55', to: '#EE1D52' }}
                        size="sm"
                        radius="xl"
                      >
                        @{verificationResult.tiktokID}
                      </Badge>
                    </div>
                  </Group>

                  {/* Video Description */}
                  {verificationResult.desc && (
                    <Paper p="md" radius="md" bg="gray.1" withBorder>
                      <Text size="sm" c="dark" lineClamp={2}>
                        {verificationResult.desc}
                      </Text>
                    </Paper>
                  )}

                  {/* Stats Grid */}
                  <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
                    {[
                      {
                        label: 'Views',
                        value: formatCount(verificationResult.playCount),
                        color: 'blue',
                        icon: <IconEye size={16} />
                      },
                      {
                        label: 'Likes',
                        value: formatCount(verificationResult.diggCount),
                        color: 'pink',
                        icon: <IconHeart size={16} />
                      },
                      {
                        label: 'Comments',
                        value: formatCount(verificationResult.commentCount),
                        color: 'teal',
                        icon: <IconMessageCircle size={16} />
                      },
                      {
                        label: 'Shares',
                        value: formatCount(verificationResult.shareCount),
                        color: 'grape',
                        icon: <IconShare size={16} />
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Paper
                          p="md"
                          radius="md"
                          style={{
                            textAlign: 'center',
                            background: `light-dark(var(--mantine-color-${stat.color}-0), var(--mantine-color-${stat.color}-9))`,
                            border: `1px solid light-dark(var(--mantine-color-${stat.color}-2), var(--mantine-color-${stat.color}-7))`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Group justify="center" gap="xs" mb="xs">
                            <Box c={`${stat.color}.6`}>
                              {stat.icon}
                            </Box>
                            <Text size="xl" fw={700} c={`${stat.color}.7`}>
                              {stat.value}
                            </Text>
                          </Group>
                          <Text size="xs" fw={500} c="dimmed">
                            {stat.label}
                          </Text>
                        </Paper>
                      </motion.div>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Flex>

              {/* Success Footer */}
              <Paper
                mt="xl"
                p="md"
                radius="md"
                style={{
                  background: 'light-dark(linear-gradient(90deg, #d3f9d8 0%, #b2f2bb 100%), linear-gradient(90deg, #2b8a3e 0%, #37b24d 100%))',
                  border: '1px solid var(--mantine-color-green-4)'
                }}
              >
                <Group gap="sm">
                  <IconCheck size={20} color="var(--mantine-color-green-7)" />
                  <Text size="sm" fw={600} c="green.8">
                    {translations.form.ready}
                  </Text>
                </Group>
              </Paper>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}