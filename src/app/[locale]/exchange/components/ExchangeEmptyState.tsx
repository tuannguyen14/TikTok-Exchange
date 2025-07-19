// components/exchange/ExchangeEmptyState.tsx

'use client';

import { Stack, Title, Text, Button, Container, ThemeIcon, Paper, Group } from '@mantine/core';
import { IconRefresh, IconSparkles, IconTrendingUp, IconRocket } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface ExchangeEmptyStateProps {
    onRefresh: () => void;
    loading?: boolean;
}

export default function ExchangeEmptyState({ onRefresh, loading = false }: ExchangeEmptyStateProps) {
    const t = useTranslations('Exchange');

    return (
        <Container size="sm" py="xl">
            <Paper
                radius="3xl"
                p="xl"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        zIndex: 0
                    }}
                />

                <Stack align="center" gap="xl" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Animated Icon */}
                    <div
                        style={{
                            position: 'relative',
                            marginBottom: '1rem'
                        }}
                    >
                        <ThemeIcon
                            size={120}
                            radius="50%"
                            variant="filled"
                            color="rgba(255,255,255,0.1)"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            <IconRocket size={60} color="white" />
                        </ThemeIcon>
                        
                        {/* Floating sparkles */}
                        <ThemeIcon
                            size={40}
                            radius="50%"
                            variant="filled"
                            color="rgba(255,215,0,0.2)"
                            style={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                backgroundColor: 'rgba(255,215,0,0.2)',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255,215,0,0.3)',
                                animation: 'bounce 2s infinite'
                            }}
                        >
                            <IconSparkles size={20} color="#FFD700" />
                        </ThemeIcon>
                        
                        <ThemeIcon
                            size={30}
                            radius="50%"
                            variant="filled"
                            color="rgba(255,107,107,0.2)"
                            style={{
                                position: 'absolute',
                                bottom: -5,
                                left: -15,
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255,107,107,0.3)',
                                animation: 'bounce 2s infinite 0.5s'
                            }}
                        >
                            <IconTrendingUp size={15} color="#ff6b6b" />
                        </ThemeIcon>
                    </div>

                    {/* Title */}
                    <Title order={2} c="white" ta="center" style={{ fontSize: '2rem' }}>
                        {t('empty.title')}
                    </Title>

                    {/* Description */}
                    <Text ta="center" c="rgba(255,255,255,0.8)" size="lg" maw={400} lh={1.6}>
                        {t('empty.description')}
                    </Text>

                    {/* Stats Cards */}
                    <Group justify="center" gap="md">
                        <Paper
                            radius="xl"
                            p="md"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                minWidth: 120
                            }}
                        >
                            <Stack gap="xs" align="center">
                                <IconSparkles size={20} color="#FFD700" />
                                <Text size="sm" c="rgba(255,255,255,0.8)">
                                    {t('empty.features.earnCredits')}
                                </Text>
                                <Text size="xs" c="rgba(255,255,255,0.6)">
                                    {t('empty.features.easyTasks')}
                                </Text>
                            </Stack>
                        </Paper>
                        
                        <Paper
                            radius="xl"
                            p="md"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                minWidth: 120
                            }}
                        >
                            <Stack gap="xs" align="center">
                                <IconTrendingUp size={20} color="#4ecdc4" />
                                <Text size="sm" c="rgba(255,255,255,0.8)">
                                    {t('empty.features.growTogether')}
                                </Text>
                                <Text size="xs" c="rgba(255,255,255,0.6)">
                                    {t('empty.features.community')}
                                </Text>
                            </Stack>
                        </Paper>
                    </Group>

                    {/* Action Button */}
                    <Button
                        size="xl"
                        radius="xl"
                        variant="filled"
                        leftSection={<IconRefresh size={20} />}
                        onClick={onRefresh}
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                            minWidth: 200,
                            fontWeight: 600
                        }}
                    >
                        {t('empty.actionButton')}
                    </Button>

                    {/* Bottom text */}
                    <Text size="sm" c="rgba(255,255,255,0.6)" ta="center">
                       {t('empty.checkBackSoon')}
                    </Text>
                </Stack>
            </Paper>

            <style jsx>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }
            `}</style>
        </Container>
    );
}