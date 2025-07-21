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
  Flex
} from '@mantine/core';
import {
  IconShield,
  IconHeart,
  IconUsers,
  IconTrendingUp,
  IconStar,
  IconBolt
} from '@tabler/icons-react';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
  gradient
}: {
  icon: any;
  title: string;
  description: string;
  index: number;
  gradient: { from: string; to: string };
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <motion.div whileHover={{ y: -8, scale: 1.02 }}>
        <Paper
          radius="xl"
          p="xl"
          style={{
            background: 'white',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            height: '100%',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background gradient on hover */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${gradient.from === 'green' ? '#10b981' : gradient.from === 'pink' ? '#ec4899' : gradient.from === 'blue' ? '#3b82f6' : '#8b5cf6'}08, ${gradient.to === 'teal' ? '#14b8a6' : gradient.to === 'red' ? '#ef4444' : gradient.to === 'cyan' ? '#06b6d4' : '#ec4899'}08)`,
              opacity: 0,
              borderRadius: '12px'
            }}
            whileHover={{ opacity: 1 }}
          />

          <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
            {/* Icon container */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ThemeIcon
                size={64}
                radius="xl"
                variant="gradient"
                gradient={gradient}
                style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
              >
                <Icon size={32} />
              </ThemeIcon>
            </motion.div>

            {/* Content */}
            <Stack gap="md">
              <Title
                order={3}
                size="xl"
                c="dark"
                fw={700}
                style={{ transition: 'color 0.3s ease' }}
              >
                {title}
              </Title>

              <Text
                c="dimmed"
                size="md"
                style={{ lineHeight: 1.6 }}
              >
                {description}
              </Text>
            </Stack>
          </Stack>

          {/* Decorative elements */}
          <Box
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 4
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  background: `linear-gradient(135deg, ${gradient.from === 'green' ? '#10b981' : gradient.from === 'pink' ? '#ec4899' : gradient.from === 'blue' ? '#3b82f6' : '#8b5cf6'}, ${gradient.to === 'teal' ? '#14b8a6' : gradient.to === 'red' ? '#ef4444' : gradient.to === 'cyan' ? '#06b6d4' : '#ec4899'})`,
                  borderRadius: '50%',
                  opacity: 0.4
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
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

const FeaturesSection = () => {
  const t = useTranslations('LandingPage.features');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: IconTrendingUp,
      title: t('items.organic.title'),
      description: t('items.organic.description'),
      gradient: { from: 'green', to: 'teal' }
    },
    {
      icon: IconHeart,
      title: t('items.credits.title'),
      description: t('items.credits.description'),
      gradient: { from: 'pink', to: 'red' }
    },
    {
      icon: IconShield,
      title: t('items.safe.title'),
      description: t('items.safe.description'),
      gradient: { from: 'blue', to: 'cyan' }
    },
    {
      icon: IconUsers,
      title: t('items.community.title'),
      description: t('items.community.description'),
      gradient: { from: 'purple', to: 'pink' }
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
            left: '2.5rem',
            width: '8rem',
            height: '8rem',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
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
            right: '2.5rem',
            width: '6rem',
            height: '6rem',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
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
              gradient={{ from: 'pink', to: 'purple' }}
              leftSection={<IconStar size={16} />}
              style={{
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                color: '#db2777',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}
            >
              Features
            </Badge>

            <Title
              order={2}
              size="3rem"
              ta="center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #db2777, #8b5cf6)',
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

        {/* Features grid */}
        <Grid gutter="xl" mb={64}>
          {features.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6 }}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                gradient={feature.gradient}
              />
            </Grid.Col>
          ))}
        </Grid>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Group justify="center">
            <Paper
              radius="xl"
              p="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <Flex align="center" gap="md">
                <Group gap={-8}>
                  {[...Array(5)].map((_, i) => {
                    const gradients = [
                      { from: 'pink', to: 'red' },
                      { from: 'blue', to: 'cyan' },
                      { from: 'purple', to: 'pink' },
                      { from: 'green', to: 'teal' },
                      { from: 'yellow', to: 'orange' }
                    ];

                    return (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant="gradient"
                          gradient={gradients[i]}
                          style={{ border: '2px solid white' }}
                        />
                      </motion.div>
                    );
                  })}
                </Group>

                <Text size="sm" c="dimmed" fw={500}>
                  Join 10,000+ creators already growing with TikGrow
                </Text>

                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ThemeIcon size="sm" color="yellow" variant="filled">
                    <IconBolt size={16} />
                  </ThemeIcon>
                </motion.div>
              </Flex>
            </Paper>
          </Group>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FeaturesSection;