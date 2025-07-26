// components/exchange/ExchangeEmptyState.tsx

'use client';

import {
    Stack,
    Title,
    Text,
    Button,
    Card,
    ThemeIcon,
    Group,
    Box,
    Paper,
    Transition,
    rem
} from '@mantine/core';
import {
    IconRefresh,
    IconSparkles,
    IconTrendingUp,
    IconHeart,
    IconUsers,
    IconTarget,
    IconGift
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface ExchangeEmptyStateProps {
    onRefresh: () => void;
    loading?: boolean;
}

export default function ExchangeEmptyState({ onRefresh, loading = false }: ExchangeEmptyStateProps) {
    const t = useTranslations('Exchange');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        {
            icon: <IconSparkles size={20} />,
            title: t('empty.features.earnCredits'),
            description: 'Earn credits for every action',
            color: 'yellow',
            gradient: { from: 'yellow', to: 'orange' }
        },
        {
            icon: <IconTrendingUp size={20} />,
            title: t('empty.features.growTogether'),
            description: 'Help creators grow their audience',
            color: 'teal',
            gradient: { from: 'teal', to: 'green' }
        },
        {
            icon: <IconTarget size={20} />,
            title: 'Complete Goals',
            description: 'Achieve campaign targets together',
            color: 'blue',
            gradient: { from: 'blue', to: 'cyan' }
        }
    ];

    const floatingElements = [
        { icon: IconHeart, color: '#ff6b6b', delay: 0, position: { top: '10%', left: '85%' } },
        { icon: IconUsers, color: '#9775fa', delay: 1000, position: { top: '70%', left: '10%' } },
        { icon: IconGift, color: '#51cf66', delay: 2000, position: { top: '20%', left: '15%' } },
        { icon: IconSparkles, color: '#ffd43b', delay: 1500, position: { top: '75%', right: '15%' } }
    ];

    return (
        <Box style={{ position: 'relative', width: '100%', maxWidth: rem(450), margin: '0 auto' }}>
            {/* Floating Background Elements */}
            {floatingElements.map((element, index) => (
                <Transition
                    key={index}
                    mounted={mounted}
                    transition="scale"
                    duration={800}
                    timingFunction="spring"
                >
                    {(styles) => (
                        <Box
                            style={{
                                ...styles,
                                position: 'absolute',
                                ...element.position,
                                zIndex: 0,
                                opacity: 0.1,
                                transform: 'scale(1.2)',
                                animation: `float 6s ease-in-out infinite ${element.delay}ms`,
                                pointerEvents: 'none'
                            }}
                        >
                            <ThemeIcon
                                size={60}
                                radius="50%"
                                variant="light"
                                color={element.color}
                                style={{
                                    backgroundColor: `${element.color}20`,
                                    border: `2px solid ${element.color}30`
                                }}
                            >
                                <element.icon size={30} color={element.color} />
                            </ThemeIcon>
                        </Box>
                    )}
                </Transition>
            ))}

            {/* Main Content Card */}
            <Transition
                mounted={mounted}
                transition="slide-up"
                duration={600}
                timingFunction="ease"
            >
                {(styles) => (
                    <Card
                        style={{
                            ...styles,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            borderRadius: rem(24),
                            padding: rem(32),
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'visible'
                        }}
                    >
                        <Stack gap="xl" align="center">
                            {/* Main Icon with Pulse Animation */}
                            {/* <Box style={{ position: 'relative' }}>
                                <ThemeIcon
                                    size={100}
                                    radius="50%"
                                    variant="gradient"
                                    gradient={{ from: '#667eea', to: '#764ba2', deg: 45 }}
                                    style={{
                                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}
                                >
                                    <IconSparkles size={50} />
                                </ThemeIcon>

                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: rem(160),
                                        height: rem(160),
                                        border: '2px dashed rgba(102, 126, 234, 0.3)',
                                        borderRadius: '50%',
                                        animation: 'rotate 20s linear infinite'
                                    }}
                                >
                                    <ThemeIcon
                                        size="sm"
                                        radius="xl"
                                        variant="light"
                                        color="red"
                                        style={{
                                            position: 'absolute',
                                            top: -8,
                                            left: '50%',
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <IconHeart size={14} />
                                    </ThemeIcon>
                                    <ThemeIcon
                                        size="sm"
                                        radius="xl"
                                        variant="light"
                                        color="violet"
                                        style={{
                                            position: 'absolute',
                                            bottom: -8,
                                            left: '50%',
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <IconUsers size={14} />
                                    </ThemeIcon>
                                </Box>
                            </Box> */}

                            {/* Title & Description */}
                            <Stack gap="sm" align="center">
                                <Title
                                    order={2}
                                    size="h1"
                                    ta="center"
                                    style={{
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        fontSize: rem(32),
                                        lineHeight: 1.2
                                    }}
                                >
                                    {t('empty.title')}
                                </Title>
                                <Text
                                    ta="center"
                                    c="dimmed"
                                    size="md"
                                    maw={360}
                                    style={{
                                        lineHeight: 1.6,
                                        fontSize: rem(16)
                                    }}
                                >
                                    {t('empty.description')}
                                </Text>
                            </Stack>

                            {/* Feature Cards */}
                            <Stack gap="sm" w="100%">
                                {features.map((feature, index) => (
                                    <Transition
                                        key={index}
                                        mounted={mounted}
                                        transition="slide-right"
                                        duration={400}
                                        timingFunction="ease"
                                    >
                                        {(styles) => (
                                            <Paper
                                                style={{
                                                    ...styles,
                                                    background: 'rgba(248, 249, 250, 0.8)',
                                                    border: '1px solid rgba(233, 236, 239, 0.8)',
                                                    borderRadius: rem(16),
                                                    padding: rem(16),
                                                    transitionDelay: `${index * 100}ms`
                                                }}
                                            >
                                                <Group gap="md" align="center">
                                                    <ThemeIcon
                                                        size="lg"
                                                        radius="xl"
                                                        variant="gradient"
                                                        gradient={feature.gradient}
                                                    >
                                                        {feature.icon}
                                                    </ThemeIcon>
                                                    <Stack gap={2} style={{ flex: 1 }}>
                                                        <Text size="sm" fw={600} c="dark">
                                                            {feature.title}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {feature.description}
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                            </Paper>
                                        )}
                                    </Transition>
                                ))}
                            </Stack>

                            {/* Call to Action */}
                            <Stack gap="md" align="center" w="100%">
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: '#667eea', to: '#764ba2' }}
                                    leftSection={<IconRefresh size={20} />}
                                    onClick={onRefresh}
                                    loading={loading}
                                    style={{
                                        minWidth: rem(200),
                                        height: rem(50),
                                        fontWeight: 600,
                                        fontSize: rem(16),
                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                        transform: 'translateY(0)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    styles={{
                                        root: {
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                                            }
                                        }
                                    }}
                                >
                                    {t('empty.actionButton')}
                                </Button>

                                <Text size="sm" c="dimmed" ta="center" style={{ opacity: 0.8 }}>
                                    {t('empty.checkBackSoon')}
                                </Text>
                            </Stack>
                        </Stack>
                    </Card>
                )}
            </Transition>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes rotate {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1.2); }
                    50% { transform: translateY(-10px) scale(1.2); }
                }
            `}</style>
        </Box>
    );
}