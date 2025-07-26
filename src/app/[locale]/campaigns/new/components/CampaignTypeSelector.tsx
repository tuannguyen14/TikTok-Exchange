'use client';
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Box,
  Center,
  ThemeIcon,
  Paper,
  Grid,
  Flex,
  ActionIcon
} from '@mantine/core';
import { useHover, useReducedMotion } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconVideo,
  IconUserPlus,
  IconSparkles,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconCheck,
  IconPlus
} from '@tabler/icons-react';
import classes from './CampaignTypeSelector.module.css';

interface CampaignTypeSelectorProps {
  selectedType: 'video' | 'follow' | null;
  onTypeSelect: (type: 'video' | 'follow') => void;
  actionCredits: any[];
  translations: any;
}

export default function CampaignTypeSelector({
  selectedType,
  onTypeSelect,
  actionCredits,
  translations
}: CampaignTypeSelectorProps) {
  const reducedMotion = useReducedMotion();
  const { hovered, ref } = useHover();

  const getCreditValue = (actionType: string) => {
    const action = actionCredits.find(a => a.action_type === actionType);
    return action?.credit_value || 0;
  };

  const typeOptions = [
    {
      type: 'video' as const,
      title: translations.campaignTypes.video.title,
      description: translations.campaignTypes.video.description,
      icon: IconVideo,
      gradient: 'linear-gradient(135deg, #FE2C55 0%, #FF6B9D 50%, #EE1D52 100%)',
      primaryColor: '#FE2C55',
      shadowColor: 'rgba(254, 44, 85, 0.25)',
      interactions: [
        {
          type: 'view',
          icon: IconEye,
          label: translations.campaignTypes.video.interactions.view,
          color: 'blue',
          credits: getCreditValue('view')
        },
        {
          type: 'like',
          icon: IconHeart,
          label: translations.campaignTypes.video.interactions.like,
          color: 'pink',
          credits: getCreditValue('like')
        },
        {
          type: 'comment',
          icon: IconMessageCircle,
          label: translations.campaignTypes.video.interactions.comment,
          color: 'teal',
          credits: getCreditValue('comment')
        }
      ]
    },
    {
      type: 'follow' as const,
      title: translations.campaignTypes.follow.title,
      description: translations.campaignTypes.follow.description,
      icon: IconUserPlus,
      gradient: 'linear-gradient(135deg, #25F4EE 0%, #00D4FF 50%, #0EA5E9 100%)',
      primaryColor: '#25F4EE',
      shadowColor: 'rgba(37, 244, 238, 0.25)',
      credits: getCreditValue('follow'),
      interactions: [{
        type: 'follow',
        icon: IconPlus,
        label: translations.campaignTypes.follow.interactions.follow,
        color: 'teal',
        credits: getCreditValue('follow')
      }]
    }
  ];

  // Animation configurations with proper types
  const springConfig = {
    type: "spring" as const,
    stiffness: 200,
    damping: 20
  };

  const fastSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 25
  };

  const getCardAnimation = (index: number) => ({
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    transition: {
      ...springConfig,
      delay: reducedMotion ? 0 : index * 0.2
    },
    whileHover: reducedMotion ? {} : {
      y: -8,
      scale: 1.02
    },
    whileTap: { scale: 0.98 }
  });

  const getInteractionAnimation = (index: number) => ({
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0
    },
    transition: {
      ...springConfig,
      delay: reducedMotion ? 0 : index * 0.1
    }
  });

  return (
    <Stack gap="xl" p="md">
      {/* Header Section */}
      <Center>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <Paper
            radius="xl"
            p="md"
            style={{
              background: 'linear-gradient(135deg, rgba(254, 44, 85, 0.1) 0%, rgba(37, 244, 238, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Group gap="xs">
              <ThemeIcon
                size="sm"
                radius="xl"
                variant="gradient"
                gradient={{ from: '#FE2C55', to: '#25F4EE' }}
              >
                <IconSparkles size={16} />
              </ThemeIcon>
              <Text fw={600} c="dark.7">
                {translations.campaignTypes.title}
              </Text>
            </Group>
          </Paper>
        </motion.div>
      </Center>

      {/* Campaign Cards */}
      <Grid>
        {typeOptions.map((option, index) => {
          const isSelected = selectedType === option.type;

          return (
            <Grid.Col key={option.type} span={{ base: 12, lg: 6 }}>
              <motion.div
                ref={ref}
                initial={getCardAnimation(index).initial}
                animate={getCardAnimation(index).animate}
                transition={getCardAnimation(index).transition}
                whileHover={getCardAnimation(index).whileHover}
                whileTap={getCardAnimation(index).whileTap}
                onClick={() => onTypeSelect(option.type)}
                style={{ height: '100%' }}
              >
                <Card
                  radius="xl"
                  p="xl"
                  shadow={isSelected ? "xl" : hovered ? "lg" : "md"}
                  style={{
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: isSelected
                      ? `2px solid ${option.primaryColor}`
                      : '1px solid var(--mantine-color-gray-2)',
                    background: isSelected
                      ? `linear-gradient(135deg, ${option.primaryColor}05, ${option.primaryColor}02)`
                      : 'white',
                    boxShadow: isSelected
                      ? `0 20px 40px ${option.shadowColor}, 0 0 0 1px ${option.primaryColor}20`
                      : undefined,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Animated Background Orbs */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 120,
                      height: 120,
                      background: `radial-gradient(circle, ${option.primaryColor}15, transparent)`,
                      borderRadius: '50%',
                      filter: 'blur(20px)',
                      opacity: hovered || isSelected ? 1 : 0.5,
                      transition: 'opacity 0.3s ease'
                    }}
                  />

                  <Box
                    style={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 80,
                      height: 80,
                      background: `radial-gradient(circle, ${option.primaryColor}10, transparent)`,
                      borderRadius: '50%',
                      filter: 'blur(15px)',
                      opacity: hovered || isSelected ? 0.8 : 0.3,
                      transition: 'opacity 0.3s ease'
                    }}
                  />

                  <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <Flex justify="space-between" align="flex-start">
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.6 }}
                      >
                        <ThemeIcon
                          size={64}
                          radius="xl"
                          variant="gradient"
                          gradient={{ from: option.primaryColor, to: option.primaryColor + '80' }}
                          style={{
                            boxShadow: `0 8px 20px ${option.shadowColor}`
                          }}
                        >
                          <option.icon size={32} />
                        </ThemeIcon>
                      </motion.div>

                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <ActionIcon
                              size="lg"
                              radius="xl"
                              variant="gradient"
                              gradient={{ from: option.primaryColor, to: option.primaryColor + '80' }}
                              style={{
                                boxShadow: `0 4px 12px ${option.shadowColor}`
                              }}
                            >
                              <IconCheck size={20} />
                            </ActionIcon>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Credit Badge for Follow */}
                      {option.type === 'follow' && (
                        <motion.div
                          initial={{ scale: 0, x: 20 }}
                          animate={{ scale: 1, x: 0 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          <Badge
                            size="lg"
                            radius="xl"
                            variant="gradient"
                            gradient={{ from: option.primaryColor, to: option.primaryColor + '80' }}
                            style={{
                              boxShadow: `0 4px 12px ${option.shadowColor}`
                            }}
                          >
                            {option.credits} credits
                          </Badge>
                        </motion.div>
                      )}
                    </Flex>

                    {/* Content */}
                    <Stack gap="sm">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Text size="xl" fw={700} c="dark.8">
                          {option.title}
                        </Text>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Text c="dark.6" size="sm" lh={1.6}>
                          {option.description}
                        </Text>
                      </motion.div>
                    </Stack>

                    {/* Interactions */}
                    {option.interactions.length > 0 && (
                      <Stack gap="xs">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Text size="sm" fw={600} c="dark.7">
                            {translations.campaignTypes.availableInteractions}
                          </Text>
                        </motion.div>

                        <Stack gap="xs">
                          {option.interactions.map((interaction, interactionIndex) => (
                            <motion.div
                              key={interaction.type}
                              initial={getInteractionAnimation(interactionIndex).initial}
                              animate={getInteractionAnimation(interactionIndex).animate}
                              transition={getInteractionAnimation(interactionIndex).transition}
                            >
                              <Paper
                                p="sm"
                                radius="lg"
                                bg="gray.0"
                                style={{
                                  border: '1px solid var(--mantine-color-gray-2)',
                                  transition: 'all 0.2s ease'
                                }}
                                className={classes.interactionCard}
                              >
                                <Flex justify="space-between" align="center">
                                  <Group gap="sm">
                                    <ThemeIcon
                                      size="sm"
                                      radius="lg"
                                      color={interaction.color}
                                      variant="light"
                                    >
                                      <interaction.icon size={16} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={500}>
                                      {interaction.label}
                                    </Text>
                                  </Group>

                                  <Badge
                                    size="sm"
                                    radius="lg"
                                    color="gray"
                                    variant="light"
                                  >
                                    {interaction.credits} credits
                                  </Badge>
                                </Flex>
                              </Paper>
                            </motion.div>
                          ))}
                        </Stack>
                      </Stack>
                    )}
                  </Stack>

                  {/* Glow Effect */}
                  <AnimatePresence>
                    {isSelected && !reducedMotion && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: [0, 0.3, 0],
                          scale: [0.8, 1.1, 1]
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          position: 'absolute',
                          inset: -2,
                          background: option.gradient,
                          borderRadius: 'var(--mantine-radius-xl)',
                          zIndex: -1,
                          filter: 'blur(10px)'
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </Grid.Col>
          );
        })}
      </Grid>
    </Stack>
  );
}