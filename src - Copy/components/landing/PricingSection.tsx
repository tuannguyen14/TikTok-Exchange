'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Group,
  Box,
  ThemeIcon,
  Stack,
  Badge,
  SimpleGrid
} from '@mantine/core';
import { 
  IconEye, 
  IconHeart, 
  IconMessageCircle, 
  IconUserPlus, 
  IconCoins, 
  IconArrowsUpDown 
} from '@tabler/icons-react';

const ActionCard = ({ 
  icon: Icon, 
  action, 
  credits, 
  emoji, 
  index, 
  gradient 
}: {
  icon: any;
  action: string;
  credits: string;
  emoji: string;
  index: number;
  gradient: { from: string; to: string };
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200
      }}
    >
      <motion.div whileHover={{ y: -5, scale: 1.02 }}>
        <Paper
          radius="xl"
          p="lg"
          style={{
            background: 'white',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Background gradient on hover */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${gradient.from}08, ${gradient.to}08)`,
              opacity: 0,
              borderRadius: '12px'
            }}
            whileHover={{ opacity: 1 }}
          />

          <Stack gap="md" style={{ position: 'relative', zIndex: 1 }}>
            {/* Icon and emoji */}
            <Group justify="space-between">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ThemeIcon
                  size={48}
                  radius="lg"
                  variant="gradient"
                  gradient={gradient}
                  style={{ boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
                >
                  <Icon size={24} />
                </ThemeIcon>
              </motion.div>
              
              <motion.div
                style={{ fontSize: '2rem' }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                {emoji}
              </motion.div>
            </Group>

            {/* Action */}
            <Title order={4} size="lg" c="dark">
              {action}
            </Title>

            {/* Credits */}
            <Title
              order={3}
              size="2rem"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}
            >
              {credits}
            </Title>
          </Stack>

          {/* Decorative elements */}
          <Box
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              gap: 4
            }}
          >
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                  borderRadius: '50%',
                  opacity: 0.6
                }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </Box>
        </Paper>
      </motion.div>
    </motion.div>
  );
};

const PricingSection = () => {
  const t = useTranslations('LandingPage.pricing');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const earnActions = [
    {
      icon: IconEye,
      action: t('earnSection.actions.view.action'),
      credits: t('earnSection.actions.view.credits'),
      emoji: t('earnSection.actions.view.icon'),
      gradient: { from: '#3b82f6', to: '#06b6d4' }
    },
    {
      icon: IconHeart,
      action: t('earnSection.actions.like.action'),
      credits: t('earnSection.actions.like.credits'),
      emoji: t('earnSection.actions.like.icon'),
      gradient: { from: '#ec4899', to: '#ef4444' }
    },
    {
      icon: IconMessageCircle,
      action: t('earnSection.actions.comment.action'),
      credits: t('earnSection.actions.comment.credits'),
      emoji: t('earnSection.actions.comment.icon'),
      gradient: { from: '#8b5cf6', to: '#ec4899' }
    },
    {
      icon: IconUserPlus,
      action: t('earnSection.actions.follow.action'),
      credits: t('earnSection.actions.follow.credits'),
      emoji: t('earnSection.actions.follow.icon'),
      gradient: { from: '#10b981', to: '#059669' }
    }
  ];

  return (
    <Box
      component="section"
      ref={containerRef}
      py={96}
      style={{
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <Box style={{ position: 'absolute', inset: 0 }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '25%',
            width: '16rem',
            height: '16rem',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.05), rgba(139, 92, 246, 0.05))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
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
            right: '25%',
            width: '12rem',
            height: '12rem',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </Box>

      <Container size="xl" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <Stack align="center" gap="xl" mb={64}>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: 'green', to: 'teal' }}
              leftSection={<IconCoins size={16} />}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              Transparent Pricing
            </Badge>
            
            <Title
              order={2}
              size="3rem"
              ta="center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #059669, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}
            >
              {t('title')}
            </Title>
            
            <Text
              size="xl"
              ta="center"
              c="dimmed"
              maw={800}
              style={{ lineHeight: 1.6 }}
            >
              {t('subtitle')}
            </Text>
          </Stack>
        </motion.div>

        <Grid gutter="xl">
          {/* Earn Credits Section */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Stack gap="xl">
                                    <Stack align="center" gap="lg">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'green', to: 'teal' }}
                      style={{ boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)' }}
                    >
                      <IconArrowsUpDown size={32} />
                    </ThemeIcon>
                  </motion.div>
                  
                  <Stack align="center" gap="sm">
                    <Title order={3} size="2rem" ta="center" c="dark">
                      {t('earnSection.title')}
                    </Title>
                    <Text ta="center" c="dimmed" size="lg">
                      {t('earnSection.subtitle')}
                    </Text>
                  </Stack>
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {earnActions.map((action, index) => (
                    <ActionCard
                      key={index}
                      icon={action.icon}
                      action={action.action}
                      credits={action.credits}
                      emoji={action.emoji}
                      index={index}
                      gradient={action.gradient}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </motion.div>
          </Grid.Col>

          {/* Spend Credits Section */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Stack gap="xl">
                <Stack align="center" gap="lg">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'purple', to: 'pink' }}
                      style={{ boxShadow: '0 15px 35px rgba(139, 92, 246, 0.3)' }}
                    >
                      <IconCoins size={32} />
                    </ThemeIcon>
                  </motion.div>
                  
                  <Stack align="center" gap="sm">
                    <Title order={3} size="2rem" ta="center" c="dark">
                      {t('spendSection.title')}
                    </Title>
                    <Text ta="center" c="dimmed" size="lg">
                      {t('spendSection.subtitle')}
                    </Text>
                  </Stack>
                </Stack>

                <motion.div whileHover={{ y: -5 }}>
                  <Paper
                    radius="xl"
                    p="xl"
                    style={{
                      background: 'white',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Stack align="center" gap="lg">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ThemeIcon
                          size={96}
                          radius="xl"
                          variant="gradient"
                          gradient={{ from: 'purple', to: 'pink' }}
                        >
                          <IconCoins size={48} />
                        </ThemeIcon>
                      </motion.div>

                      <Stack align="center" gap="md">
                        <Title order={4} size="xl" ta="center" c="dark">
                          Use Your Earned Credits
                        </Title>

                        <Text ta="center" c="dimmed" size="md">
                          {t('spendSection.note')}
                        </Text>
                      </Stack>

                      <SimpleGrid cols={2} spacing="md" w="100%">
                        <Paper
                          radius="lg"
                          p="md"
                          style={{
                            background: '#f8fafc',
                            textAlign: 'center'
                          }}
                        >
                          <Stack gap="xs">
                            <Text size="2rem">👁️</Text>
                            <Text fw={500} c="dark">Views</Text>
                            <Text c="dimmed" size="sm">1 credit each</Text>
                          </Stack>
                        </Paper>
                        
                        <Paper
                          radius="lg"
                          p="md"
                          style={{
                            background: '#f8fafc',
                            textAlign: 'center'
                          }}
                        >
                          <Stack gap="xs">
                            <Text size="2rem">❤️</Text>
                            <Text fw={500} c="dark">Likes</Text>
                            <Text c="dimmed" size="sm">2 credits each</Text>
                          </Stack>
                        </Paper>
                        
                        <Paper
                          radius="lg"
                          p="md"
                          style={{
                            background: '#f8fafc',
                            textAlign: 'center'
                          }}
                        >
                          <Stack gap="xs">
                            <Text size="2rem">💬</Text>
                            <Text fw={500} c="dark">Comments</Text>
                            <Text c="dimmed" size="sm">3 credits each</Text>
                          </Stack>
                        </Paper>
                        
                        <Paper
                          radius="lg"
                          p="md"
                          style={{
                            background: '#f8fafc',
                            textAlign: 'center'
                          }}
                        >
                          <Stack gap="xs">
                            <Text size="2rem">👥</Text>
                            <Text fw={500} c="dark">Follows</Text>
                            <Text c="dimmed" size="sm">5 credits each</Text>
                          </Stack>
                        </Paper>
                      </SimpleGrid>
                    </Stack>
                  </Paper>
                </motion.div>
              </Stack>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginTop: '4rem' }}
        >
          <Group justify="center">
            <Paper
              radius="xl"
              p="lg"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <Group gap="md">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ThemeIcon size="md" color="green" variant="filled">
                    <IconCoins size={20} />
                  </ThemeIcon>
                </motion.div>
                
                <Text c="green.7" fw={500} size="lg">
                  100% Free to Use • No Hidden Fees • Fair Exchange System
                </Text>
              </Group>
            </Paper>
          </Group>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PricingSection;