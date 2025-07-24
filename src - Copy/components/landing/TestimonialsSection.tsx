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
  Avatar,
  Rating,
  Flex
} from '@mantine/core';
import {
  IconStar,
  IconQuote,
  IconTrendingUp
} from '@tabler/icons-react';

const TestimonialCard = ({
  name,
  username,
  content,
  rating,
  index
}: {
  name: string;
  username: string;
  content: string;
  rating: number;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
    >
      <motion.div whileHover={{ y: -8, scale: 1.02 }}>
        <Paper
          radius="xl"
          p="xl"
          style={{
            background: 'white',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Quote icon */}
          <motion.div
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              opacity: 0.1
            }}
            whileHover={{ rotate: 15, scale: 1.2, opacity: 0.2 }}
          >
            <IconQuote size={48} color="#db2777" />
          </motion.div>

          <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
            {/* Avatar and user info */}
            <Group>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Avatar
                  size={56}
                  radius="xl"
                  style={{
                    background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  {name.charAt(0)}
                </Avatar>
              </motion.div>

              <Stack gap={4}>
                <Text fw={600} c="dark" size="lg">{name}</Text>
                <Text c="pink.6" size="sm" fw={500}>{username}</Text>
              </Stack>
            </Group>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 + 0.5 }}
            >
              <Rating value={rating} readOnly color="yellow" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
            >
              <Text
                c="dimmed"
                size="md"
                style={{
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}
              >
                &quot;{content}&quot;
              </Text>
            </motion.div>
          </Stack>

          {/* Decorative elements */}
          <Box
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
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
                  background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                  borderRadius: '50%',
                  opacity: 0.5
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
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

          {/* Hover effect overlay */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(139, 92, 246, 0.05))',
              opacity: 0,
              borderRadius: '12px'
            }}
            whileHover={{ opacity: 1 }}
          />
        </Paper>
      </motion.div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const t = useTranslations('LandingPage.testimonials');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: t('items.testimonial1.name'),
      username: t('items.testimonial1.username'),
      content: t('items.testimonial1.content'),
      rating: 5
    },
    {
      name: t('items.testimonial2.name'),
      username: t('items.testimonial2.username'),
      content: t('items.testimonial2.content'),
      rating: 5
    },
    {
      name: t('items.testimonial3.name'),
      username: t('items.testimonial3.username'),
      content: t('items.testimonial3.content'),
      rating: 5
    }
  ];

  return (
    <Box
      component="section"
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
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.02) 0%, rgba(139, 92, 246, 0.02) 50%, rgba(59, 130, 246, 0.02) 100%)'
          }}
        />

        {/* Floating testimonial bubbles */}
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '2.5rem',
            width: '5rem',
            height: '5rem',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            bottom: '5rem',
            right: '5rem',
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
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
              gradient={{ from: 'yellow', to: 'orange' }}
              leftSection={<IconStar size={16} />}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              Testimonials
            </Badge>

            <Title
              order={2}
              size="3rem"
              ta="center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #d97706, #ea580c)',
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

        {/* Testimonials grid */}
        <Grid gutter="xl" mb={64}>
          {testimonials.map((testimonial, index) => (
            <Grid.Col key={index} span={{ base: 12, lg: 4 }}>
              <TestimonialCard
                name={testimonial.name}
                username={testimonial.username}
                content={testimonial.content}
                rating={testimonial.rating}
                index={index}
              />
            </Grid.Col>
          ))}
        </Grid>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper
            radius="xl"
            p="xl"
            maw={900}
            mx="auto"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}
          >
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      <Title order={2} size="3rem" c="pink.6">
                        4.9/5
                      </Title>
                    </motion.div>

                    <Group justify="center" gap={2}>
                      {[...Array(5)].map((_, i) => (
                        <IconStar key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </Group>

                    <Text c="dimmed" size="sm">Average Rating</Text>
                  </Stack>
                </motion.div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <Title order={2} size="3rem" c="purple.6">
                        10,000+
                      </Title>
                    </motion.div>

                    <Group justify="center">
                      <IconTrendingUp size={20} color="#8b5cf6" />
                    </Group>

                    <Text c="dimmed" size="sm">Happy Creators</Text>
                  </Stack>
                </motion.div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center' }}
                >
                  <Stack gap="sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <Title order={2} size="3rem" c="blue.6">
                        98%
                      </Title>
                    </motion.div>

                    <Group justify="center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <IconStar size={20} color="#3b82f6" />
                      </motion.div>
                    </Group>

                    <Text c="dimmed" size="sm">Success Rate</Text>
                  </Stack>
                </motion.div>
              </Grid.Col>
            </Grid>
          </Paper>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          style={{ marginTop: '3rem' }}
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
              <Text size="sm" c="dimmed">Trusted by creators worldwide</Text>
            </Flex>
            <Flex align="center" gap="xs">
              <Box
                w={8}
                h={8}
                bg="blue"
                style={{ borderRadius: '50%' }}
                className="animate-pulse"
              />
              <Text size="sm" c="dimmed">Safe & secure platform</Text>
            </Flex>
            <Flex align="center" gap="xs">
              <Box
                w={8}
                h={8}
                bg="purple"
                style={{ borderRadius: '50%' }}
                className="animate-pulse"
              />
              <Text size="sm" c="dimmed">Real organic growth</Text>
            </Flex>
          </Group>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;