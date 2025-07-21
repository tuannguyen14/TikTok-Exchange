'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Box,
  ThemeIcon,
  Stack,
  Badge,
  Paper,
  SimpleGrid,
  Flex,
  Avatar
} from '@mantine/core';
import { 
  IconArrowRight, 
  IconSparkles, 
  IconShield, 
  IconTrendingUp, 
  IconCheck 
} from '@tabler/icons-react';

const CTASection = () => {
  const t = useTranslations('LandingPage.cta');
  const router = useRouter();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  const features = [
    {
      text: t('features.free'),
      icon: IconCheck
    },
    {
      text: t('features.noPassword'),
      icon: IconShield
    },
    {
      text: t('features.organic'),
      icon: IconTrendingUp
    }
  ];

  return (
    <Box
      component="section"
      ref={containerRef}
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <Box style={{ position: 'absolute', inset: 0 }}>
        {/* Animated background pattern */}
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='6' cy='6' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.1
          }}
        />
        
        {/* Floating elements */}
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '5rem',
            width: '8rem',
            height: '8rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          style={{
            position: 'absolute',
            bottom: '5rem',
            right: '5rem',
            width: '6rem',
            height: '6rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '24rem',
            height: '24rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(4rem)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Box>

      <Container size="lg" style={{ position: 'relative', zIndex: 10 }}>
        <Stack align="center" gap="xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <Stack align="center" gap="lg">
              <motion.div
                whileHover={{ scale: 1.05 }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Badge
                  size="lg"
                  variant="filled"
                  color="white"
                  leftSection={<IconSparkles size={16} />}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Start Your Journey
                </Badge>
              </motion.div>
              
              <Title
                order={2}
                size="4rem"
                ta="center"
                c="white"
                style={{ fontWeight: 700 }}
              >
                {t('title')}
              </Title>
              
              <Text
                size="xl"
                ta="center"
                c="white"
                opacity={0.9}
                maw={800}
                style={{ lineHeight: 1.6 }}
              >
                {t('subtitle')}
              </Text>
            </Stack>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="xl"
                onClick={handleGetStarted}
                variant="filled"
                color="white"
                rightSection={
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <IconArrowRight size={24} />
                  </motion.div>
                }
                style={{
                  color: '#8b5cf6',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  padding: '1.25rem 2.5rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {t('button')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Group justify="center" gap="xl">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Flex align="center" gap="sm">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut",
                      }}
                    >
                      <ThemeIcon
                        size="sm"
                        color="white"
                        variant="filled"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      >
                        <feature.icon size={16} />
                      </ThemeIcon>
                    </motion.div>
                    <Text c="white" fw={500} opacity={0.9}>
                      {feature.text}
                    </Text>
                  </Flex>
                </motion.div>
              ))}
            </Group>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Paper
              radius="xl"
              p="xl"
              maw={800}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      <Title order={3} size="3rem" c="white">
                        10,000+
                      </Title>
                    </motion.div>
                    <Text c="white" opacity={0.8}>Active Creators</Text>
                    <Group justify="center" gap={-8}>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -5, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        >
                          <Avatar
                            size="sm"
                            radius="xl"
                            style={{
                              background: `linear-gradient(45deg, ${['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i]}, ${['#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][i]})`,
                              border: '2px solid rgba(255, 255, 255, 0.5)'
                            }}
                          />
                        </motion.div>
                      ))}
                    </Group>
                  </Stack>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <Title order={3} size="3rem" c="white">
                        1M+
                      </Title>
                    </motion.div>
                    <Text c="white" opacity={0.8}>Real Interactions</Text>
                    <motion.div
                      style={{ fontSize: '2rem' }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1,
                      }}
                    >
                      ❤️💬👁️
                    </motion.div>
                  </Stack>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <Title order={3} size="3rem" c="white">
                        98%
                      </Title>
                    </motion.div>
                    <Text c="white" opacity={0.8}>Success Rate</Text>
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ThemeIcon size="lg" color="white" variant="filled" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <IconTrendingUp size={32} />
                      </ThemeIcon>
                    </motion.div>
                  </Stack>
                </motion.div>
              </SimpleGrid>
            </Paper>
          </motion.div>

          {/* Final encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Stack align="center" gap="lg">
              <Text c="white" opacity={0.8} size="lg" ta="center">
                Join thousands of creators who are already growing organically with TikGrow
              </Text>
              
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ThemeIcon size="md" color="white" variant="filled" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <IconSparkles size={24} />
                </ThemeIcon>
              </motion.div>
            </Stack>
          </motion.div>
        </Stack>
      </Container>

      {/* Bottom wave decoration */}
      <Box style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          style={{ display: 'block', width: '100%', height: '4rem' }}
        >
          <motion.path
            d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
            fill="white"
            fillOpacity="0.1"
            animate={{
              d: [
                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
                "M0,60 C150,0 350,120 600,60 C850,0 1050,120 1200,60 L1200,120 L0,120 Z",
                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </Box>
    </Box>
  );
};

export default CTASection;