// components/exchange/ExchangeEmptyState.tsx

'use client';

import { Stack, Title, Text, Button, Card, ThemeIcon, Group, Center } from '@mantine/core';
import { IconRefresh, IconSparkles, IconTrendingUp } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface ExchangeEmptyStateProps {
    onRefresh: () => void;
    loading?: boolean;
}

export default function ExchangeEmptyState({ onRefresh, loading = false }: ExchangeEmptyStateProps) {
    const t = useTranslations('Exchange');

    return (
        <Card
            radius="lg"
            p="xl"
            shadow="sm"
            style={{
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                maxWidth: 480,
                margin: '0 auto',
                textAlign: 'center'
            }}
        >
            <Stack gap="lg" align="center">
                {/* Main Icon */}
                <Center>
                    <ThemeIcon
                        size={80}
                        radius="50%"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                        style={{
                            boxShadow: '0 4px 12px rgba(34, 139, 230, 0.2)'
                        }}
                    >
                        <IconSparkles size={40} />
                    </ThemeIcon>
                </Center>

                {/* Title & Description */}
                <Stack gap="xs" align="center">
                    <Title order={3} c="dark" ta="center" size="xl">
                        {t('empty.title')}
                    </Title>
                    <Text ta="center" c="dimmed" size="sm" maw={320} lh={1.5}>
                        {t('empty.description')}
                    </Text>
                </Stack>

                {/* Feature Cards */}
                <Group justify="center" gap="sm">
                    <Card
                        radius="md"
                        p="sm"
                        style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            minWidth: 100,
                            flex: 1,
                            maxWidth: 140
                        }}
                    >
                        <Stack gap={4} align="center">
                            <ThemeIcon size="sm" variant="light" color="yellow">
                                <IconSparkles size={14} />
                            </ThemeIcon>
                            <Text size="xs" fw={500} c="dark" ta="center">
                                {t('empty.features.earnCredits')}
                            </Text>
                        </Stack>
                    </Card>
                    
                    <Card
                        radius="md"
                        p="sm"
                        style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            minWidth: 100,
                            flex: 1,
                            maxWidth: 140
                        }}
                    >
                        <Stack gap={4} align="center">
                            <ThemeIcon size="sm" variant="light" color="teal">
                                <IconTrendingUp size={14} />
                            </ThemeIcon>
                            <Text size="xs" fw={500} c="dark" ta="center">
                                {t('empty.features.growTogether')}
                            </Text>
                        </Stack>
                    </Card>
                </Group>

                {/* Action Button */}
                <Button
                    size="md"
                    radius="md"
                    variant="filled"
                    leftSection={<IconRefresh size={16} />}
                    onClick={onRefresh}
                    loading={loading}
                    style={{
                        minWidth: 160
                    }}
                >
                    {t('empty.actionButton')}
                </Button>

                {/* Bottom text */}
                <Text size="xs" c="dimmed" ta="center">
                   {t('empty.checkBackSoon')}
                </Text>
            </Stack>
        </Card>
    );
}