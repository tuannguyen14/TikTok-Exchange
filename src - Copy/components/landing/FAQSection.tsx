'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Box,
  ThemeIcon,
  Stack,
  Badge,
  Button,
  Collapse,
  ActionIcon,
  Flex
} from '@mantine/core';
import {
  IconChevronDown,
  IconHelpCircle,
  IconShield,
  IconBolt,
  IconUsers,
  IconCurrencyDollar
} from '@tabler/icons-react';

const FAQItem = ({
  question,
  answer,
  index,
  icon: Icon
}: {
  question: string;
  answer: string;
  index: number;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div whileHover={{ y: -2 }}>
        <Paper
          radius="xl"
          style={{
            background: 'white',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <Group
            p="lg"
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Group gap="md" style={{ flex: 1 }}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <ThemeIcon
                  size={40}
                  radius="lg"
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'purple' }}
                  style={{ boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)' }}
                >
                  <Icon size={20} />
                </ThemeIcon>
              </motion.div>

              <Text
                size="lg"
                fw={600}
                c="dark"
                style={{
                  transition: 'color 0.3s ease'
                }}
              >
                {question}
              </Text>
            </Group>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ActionIcon
                variant="subtle"
                color="pink"
                size="lg"
              >
                <IconChevronDown size={20} />
              </ActionIcon>
            </motion.div>
          </Group>

          <Collapse in={isOpen}>
            <Box
              p="lg"
              pt={0}
              style={{
                borderTop: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Text
                c="dimmed"
                size="md"
                style={{ lineHeight: 1.6 }}
              >
                {answer}
              </Text>
            </Box>
          </Collapse>

          {/* Decorative element */}
          <Box
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 8,
              height: 8,
              background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
              borderRadius: '50%',
              opacity: 0.6
            }}
          />
        </Paper>
      </motion.div>
    </motion.div>
  );
};

const FAQSection = () => {
  const t = useTranslations('LandingPage.faq');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const faqs = [
    {
      question: t('items.safe.question'),
      answer: t('items.safe.answer'),
      icon: IconShield
    },
    {
      question: t('items.howCredits.question'),
      answer: t('items.howCredits.answer'),
      icon: IconBolt
    },
    {
      question: t('items.realUsers.question'),
      answer: t('items.realUsers.answer'),
      icon: IconUsers
    },
    {
      question: t('items.results.question'),
      answer: t('items.results.answer'),
      icon: IconHelpCircle
    },
    {
      question: t('items.pricing.question'),
      answer: t('items.pricing.answer'),
      icon: IconCurrencyDollar
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
            right: '25%',
            width: '18rem',
            height: '18rem',
            background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            bottom: '5rem',
            left: '25%',
            width: '14rem',
            height: '14rem',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
            borderRadius: '50%',
            filter: 'blur(3rem)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Box>

      <Container size="lg" style={{ position: 'relative', zIndex: 10 }}>
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
              gradient={{ from: 'blue', to: 'purple' }}
              leftSection={<IconHelpCircle size={16} />}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              FAQ
            </Badge>

            <Title
              order={2}
              size="3rem"
              ta="center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #2563eb, #8b5cf6)',
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

        {/* FAQ Items */}
        <Stack gap="md" mb={64}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
              icon={faq.icon}
            />
          ))}
        </Stack>

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper
            radius="xl"
            p="xl"
            maw={700}
            mx="auto"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              textAlign: 'center'
            }}
          >
            <Stack gap="lg">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ThemeIcon
                  size={64}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'purple' }}
                  mx="auto"
                  style={{ boxShadow: '0 15px 35px rgba(236, 72, 153, 0.4)' }}
                >
                  <IconHelpCircle size={32} />
                </ThemeIcon>
              </motion.div>

              <Stack gap="md">
                <Title order={3} size="2rem" c="dark">
                  Still Have Questions?
                </Title>

                <Text c="dimmed" size="lg" maw={500} mx="auto">
                  Can&apos;t find the answer you&apos;re looking for? Our friendly support team is here to help you get started with TikGrow.
                </Text>
              </Stack>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'purple' }}
                  style={{
                    boxShadow: '0 10px 30px rgba(236, 72, 153, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Contact Support
                </Button>
              </motion.div>

              <Group justify="center" gap="xl" mt="md">
                <Flex align="center" gap="xs">
                  <Box
                    w={8}
                    h={8}
                    bg="green"
                    style={{ borderRadius: '50%' }}
                    className="animate-pulse"
                  />
                  <Text size="sm" c="dimmed">24/7 Support</Text>
                </Flex>
                <Flex align="center" gap="xs">
                  <Box
                    w={8}
                    h={8}
                    bg="blue"
                    style={{ borderRadius: '50%' }}
                    className="animate-pulse"
                  />
                  <Text size="sm" c="dimmed">Quick Response</Text>
                </Flex>
                <Flex align="center" gap="xs">
                  <Box
                    w={8}
                    h={8}
                    bg="purple"
                    style={{ borderRadius: '50%' }}
                    className="animate-pulse"
                  />
                  <Text size="sm" c="dimmed">Expert Help</Text>
                </Flex>
              </Group>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FAQSection;