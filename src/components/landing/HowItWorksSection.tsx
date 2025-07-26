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
  Button,
  Flex
} from '@mantine/core';
import {
  IconUserPlus,
  IconCoins,
  IconRocket,
  IconArrowRight,
  IconCheckbox
} from '@tabler/icons-react';

const StepCard = ({
  step,
  icon: Icon,
  title,
  description,
  index,
  isLast = false
}: {
  step: string;
  icon: any;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <Box ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Step number and icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{
          duration: 0.6,
          delay: index * 0.2,
          type: "spring",
          stiffness: 200
        }}
        style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ThemeIcon
            size={96}
            radius="xl"
            variant="gradient"
            gradient={{ from: 'pink', to: 'purple' }}
            style={{ boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' }}
          >
            <Icon size={40} />
          </ThemeIcon>
        </motion.div>

        {/* Step number badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
          style={{
            position: 'absolute',
            top: -8,
            right: -8
          }}
        >
          <ThemeIcon
            size={32}
            radius="xl"
            variant="filled"
            color="white"
            style={{
              border: '2px solid #db2777',
              color: '#db2777',
              fontWeight: 700
            }}
          >
            {step}
          </ThemeIcon>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
        style={{ textAlign: 'center', maxWidth: '300px' }}
      >
        <Stack gap="md">
          <Title order={3} size="xl" c="dark">
            {title}
          </Title>
          <Text c="dimmed" style={{ lineHeight: 1.6 }}>
            {description}
          </Text>
        </Stack>
      </motion.div>

      {/* Connecting arrow */}
      {!isLast && (
        <motion.div
          style={{
            display: 'none',
            position: 'absolute',
            top: 48,
            left: '100%',
            transform: 'translateY(-50%)',
            width: '8rem',
            zIndex: 0
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
          className="lg:block"
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <IconArrowRight size={32} color="#db2777" />
            <Box
              style={{
                width: '100%',
                height: 2,
                background: 'linear-gradient(90deg, #db2777, #8b5cf6)',
                marginTop: 8,
                borderRadius: 1
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </Box>
  );
};

const HowItWorksSection = () => {
  const t = useTranslations('LandingPage.howItWorks');
  const t2 = useTranslations('LandingPage.howItWorksSection');

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    {
      step: '1',
      icon: IconUserPlus,
      title: t('steps.step1.title'),
      description: t('steps.step1.description')
    },
    {
      step: '2',
      icon: IconCoins,
      title: t('steps.step2.title'),
      description: t('steps.step2.description')
    },
    {
      step: '3',
      icon: IconRocket,
      title: t('steps.step3.title'),
      description: t('steps.step3.description')
    }
  ];

  return (
    <Box
      component="section"
      id="how-it-works"
      ref={containerRef}
      py={96}
      style={{
        background: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <Box style={{ position: 'absolute', inset: 0 }}>
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.03) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(59, 130, 246, 0.03) 100%)'
          }}
        />

        {/* Animated background elements */}
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            right: '5rem',
            width: '10rem',
            height: '10rem',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            bottom: '5rem',
            left: '5rem',
            width: '8rem',
            height: '8rem',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
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
          <Stack align="center" gap="xl" mb={80}>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: 'pink', to: 'purple' }}
              leftSection={<IconCheckbox size={16} />}
              style={{
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                color: '#db2777',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}
            >
              Simple Process
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

        {/* Steps */}
        <Grid gutter="xl" mb={80}>
          {steps.map((step, index) => (
            <Grid.Col key={index} span={{ base: 12, lg: 4 }}>
              <StepCard
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
                index={index}
                isLast={index === steps.length - 1}
              />
            </Grid.Col>
          ))}
        </Grid>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Group justify="center">
            <Paper
              radius="xl"
              p="xl"
              maw={700}
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                textAlign: 'center'
              }}
            >
              <Stack gap="lg">
                <Title order={3} size="2rem" c="dark">
                  {t2('title')}
                </Title>

                <Text c="dimmed" size="lg">
                  {t2('subtitle')}
                </Text>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="xl"
                    variant="gradient"
                    gradient={{ from: 'pink', to: 'purple' }}
                    rightSection={
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <IconArrowRight size={20} />
                      </motion.div>
                    }
                    onClick={() => window.location.href = '/auth'}
                    style={{
                      boxShadow: '0 15px 35px rgba(236, 72, 153, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t2('cta')}
                  </Button>
                </motion.div>

                <Group justify="center" gap="xl" mt="md">
                  <Flex align="center" gap="xs">
                    <IconCheckbox size={16} color="#10b981" />
                    <Text size="sm" c="dimmed">{t2('features.freeToStart')}</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <IconCheckbox size={16} color="#10b981" />
                    <Text size="sm" c="dimmed">{t2('features.noCreditCard')}</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <IconCheckbox size={16} color="#10b981" />
                    <Text size="sm" c="dimmed">{t2('features.freeCredits')}</Text>
                  </Flex>
                </Group>
              </Stack>
            </Paper>
          </Group>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;