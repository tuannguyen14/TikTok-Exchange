'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Box,
  Center,
  Flex,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowRight,
  IconPlayerPlay,
  IconSparkles,
  IconTrendingUp,
  IconUsers
} from '@tabler/icons-react';

const HeroSection = () => {
  const t = useTranslations('LandingPage.hero');
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleLearnMore = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      component="section"
      style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 50%, #dbeafe 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Animated background elements */}
      <Box style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '2.5rem',
            width: '5rem',
            height: '5rem',
            background: 'linear-gradient(45deg, #ec4899, #ef4444)',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(2rem)',
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            top: '10rem',
            right: '5rem',
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(2rem)',
          }}
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </Box>

      <Container size="xl" style={{ position: 'relative', zIndex: 10, marginBottom: '3rem' }}>
        <Center>
          <Stack align="center" gap="xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: 'pink', to: 'purple' }}
                leftSection={<IconSparkles size={16} />}
              >
                100% Organic Growth Platform
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Stack align="center" gap="md">
                <Title
                  order={1}
                  size="4rem"
                  ta="center"
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #db2777, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    fontWeight: 700
                  }}
                >
                  {t('title')}
                </Title>

                <Flex align="center" gap="sm">
                  <Title
                    order={1}
                    size="4rem"
                    ta="center"
                    style={{
                      background: 'linear-gradient(135deg, #db2777, #ef4444)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1,
                      fontWeight: 700,
                      paddingBottom: 10
                    }}
                  >
                    {t('subtitle')}
                  </Title>

                  <motion.div
                    animate={{
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ThemeIcon
                      size="lg"
                      variant="gradient"
                      gradient={{ from: 'pink', to: 'purple' }}
                    >
                      <IconTrendingUp size={24} />
                    </ThemeIcon>
                  </motion.div>
                </Flex>
              </Stack>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ marginTop: 30 }}
            >
              <Text
                size="xl"
                ta="center"
                c="dimmed"
                maw={800}
                style={{ lineHeight: 1.6 }}
              >
                {t('description')}
              </Text>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Group justify="center" gap="md">
                <Button
                  size="xl"
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'red' }}
                  rightSection={
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <IconArrowRight size={20} />
                    </motion.div>
                  }
                  onClick={handleGetStarted}
                  style={{
                    boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('cta')}
                </Button>

                <Button
                  size="xl"
                  variant="outline"
                  color="pink"
                  leftSection={<IconPlayerPlay size={20} />}
                  onClick={handleLearnMore}
                >
                  {t('ctaSecondary')}
                </Button>
              </Group>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Group justify="center" gap="sm">
                <Flex align="center" gap="sm">
                  <IconUsers size={16} />
                  <Text size="sm" c="dimmed">No password required</Text>
                </Flex>
                <Flex align="center" gap="sm">
                  <IconSparkles size={16} />
                  <Text size="sm" c="dimmed">100% Safe & Secure</Text>
                </Flex>
                <Flex align="center" gap="sm">
                  <IconTrendingUp size={16} />
                  <Text size="sm" c="dimmed">Real organic growth</Text>
                </Flex>
              </Group>
            </motion.div>
          </Stack>
        </Center>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Box
          style={{
            width: 24,
            height: 40,
            border: '2px solid #9ca3af',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <motion.div
            style={{
              width: 4,
              height: 12,
              backgroundColor: '#9ca3af',
              borderRadius: '2px',
              marginTop: 8
            }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default HeroSection;