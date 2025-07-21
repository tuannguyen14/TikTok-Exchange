'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
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
  Flex,
  Badge
} from '@mantine/core';

const AnimatedNumber = ({ 
  value, 
  duration = 2 
}: { 
  value: string; 
  duration?: number; 
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    const suffix = value.replace(/[0-9,]/g, '');
    
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (numericValue - startValue) * easeOutQuart);
      
      const formattedValue = currentValue.toLocaleString() + suffix;
      setDisplayValue(formattedValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
};

const StatsSection = () => {
  const t = useTranslations('LandingPage.hero.stats');
  const t2 = useTranslations('LandingPage.statsSection');
  
  const stats = [
    {
      value: t('users'),
      label: t('usersLabel'),
      gradient: { from: 'pink', to: 'red' },
      icon: '👥'
    },
    {
      value: t('interactions'),
      label: t('interactionsLabel'),
      gradient: { from: 'purple', to: 'pink' },
      icon: '❤️'
    },
    {
      value: t('growth'),
      label: t('growthLabel'),
      gradient: { from: 'blue', to: 'cyan' },
      icon: '📈'
    }
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <Box
      component="section"
      ref={containerRef}
      py={80}
      style={{
        background: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)'
        }}
      />
      
      <Container size="xl" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <Stack align="center" gap="xl" mb={64}>
            <Title
              order={2}
              size="2.5rem"
              ta="center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #db2777)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t2('title')}
            </Title>
            
            <Text
              size="xl"
              ta="center"
              c="dimmed"
              maw={600}
              style={{ lineHeight: 1.6 }}
            >
              {t2('subtitle')}
            </Text>
          </Stack>
        </motion.div>

        <Grid gutter="xl">
          {stats.map((stat, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2 + 0.3,
                  ease: "easeOut"
                }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -5 }}>
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
                        background: `linear-gradient(135deg, ${stat.gradient.from === 'pink' ? '#ec4899' : stat.gradient.from === 'purple' ? '#a855f7' : '#3b82f6'}10, ${stat.gradient.to === 'red' ? '#ef4444' : stat.gradient.to === 'pink' ? '#ec4899' : '#06b6d4'}10)`,
                        opacity: 0,
                        borderRadius: '12px'
                      }}
                      whileHover={{ opacity: 1 }}
                    />

                    <Stack align="center" gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                      {/* Icon */}
                      <motion.div
                        style={{ fontSize: '3rem' }}
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1] 
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        {stat.icon}
                      </motion.div>

                      {/* Value */}
                      <Title
                        order={2}
                        size="3rem"
                        ta="center"
                        style={{
                          background: `linear-gradient(135deg, ${stat.gradient.from === 'pink' ? '#ec4899' : stat.gradient.from === 'purple' ? '#a855f7' : '#3b82f6'}, ${stat.gradient.to === 'red' ? '#ef4444' : stat.gradient.to === 'pink' ? '#ec4899' : '#06b6d4'})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 700
                        }}
                      >
                        <AnimatedNumber value={stat.value} duration={2} />
                      </Title>

                      {/* Label */}
                      <Text
                        size="lg"
                        ta="center"
                        c="dimmed"
                        fw={500}
                      >
                        {stat.label}
                      </Text>
                    </Stack>

                    {/* Decorative dot */}
                    <Box
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 8,
                        height: 8,
                        background: `linear-gradient(135deg, ${stat.gradient.from === 'pink' ? '#ec4899' : stat.gradient.from === 'purple' ? '#a855f7' : '#3b82f6'}, ${stat.gradient.to === 'red' ? '#ef4444' : stat.gradient.to === 'pink' ? '#ec4899' : '#06b6d4'})`,
                        borderRadius: '50%',
                        opacity: 0.6
                      }}
                    />
                  </Paper>
                </motion.div>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>

        {/* Additional trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          style={{ marginTop: '4rem' }}
        >
          <Group justify="center" gap="xl">
            <Flex align="center" gap="xs">
              <Box
                w={8}
                h={8}
                bg="green"
                style={{ borderRadius: '50%' }}
                className="animate-pulse"
              />
              <Text size="sm" c="dimmed">{t2('items.noBots')}</Text>
            </Flex>
            <Flex align="center" gap="xs">
              <Box
                w={8}
                h={8}
                bg="blue"
                style={{ borderRadius: '50%' }}
                className="animate-pulse"
              />
              <Text size="sm" c="dimmed">{t2('items.organic')}</Text>
            </Flex>
            <Flex align="center" gap="xs">
              <Box
                w={8}
                h={8}
                bg="purple"
                style={{ borderRadius: '50%' }}
                className="animate-pulse"
              />
              <Text size="sm" c="dimmed">{t2('items.safe')}</Text>
            </Flex>
          </Group>
        </motion.div>
      </Container>
    </Box>
  );
};

export default StatsSection;