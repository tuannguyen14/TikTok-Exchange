'use client';

import React from 'react';
import { Container, Group, Text, ActionIcon, Stack, Divider } from '@mantine/core';
import { IconBrandTiktok, IconMail, IconHeart } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer style={{
            backgroundColor: '#1a1a1a',
            borderTop: '1px solid #2d2d2d',
            marginTop: 'auto'
        }}>
            <Container size="lg" py="md">
                <Stack gap="md">
                    {/* Main Footer Content */}
                    <Group justify="space-between" align="flex-start">
                        {/* Brand Section */}
                        <Stack gap="xs">
                            <Group align="center" gap="xs">
                                <ActionIcon
                                    variant="filled"
                                    size="lg"
                                    style={{
                                        backgroundColor: '#FE2C55',
                                        color: 'white'
                                    }}
                                >
                                    <IconBrandTiktok size={20} />
                                </ActionIcon>
                                <Text
                                    size="lg"
                                    fw={700}
                                    style={{
                                        background: 'linear-gradient(45deg, #FE2C55, #25F4EE)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {t('brand.title')}
                                </Text>
                            </Group>
                            <Text size="sm" c="dimmed" style={{ maxWidth: '300px' }}>
                                {t('brand.description')}
                            </Text>
                        </Stack>

                        {/* Quick Links */}
                        {/* <Stack gap="xs">
                            <Text size="sm" fw={600} c="white">
                                {t('links.title')}
                            </Text>
                            <Stack gap={4}>
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ cursor: 'pointer' }}
                                    className="hover:text-[#FE2C55] transition-colors"
                                >
                                    {t('links.terms')}
                                </Text>
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ cursor: 'pointer' }}
                                    className="hover:text-[#FE2C55] transition-colors"
                                >
                                    {t('links.privacy')}
                                </Text>
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ cursor: 'pointer' }}
                                    className="hover:text-[#FE2C55] transition-colors"
                                >
                                    {t('links.guide')}
                                </Text>
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ cursor: 'pointer' }}
                                    className="hover:text-[#FE2C55] transition-colors"
                                >
                                    {t('links.support')}
                                </Text>
                            </Stack>
                        </Stack> */}

                        {/* Contact Info */}
                        {/* <Stack gap="xs">
                            <Text size="sm" fw={600} c="white">
                                {t('contact.title')}
                            </Text>
                            <Group gap="xs">
                                <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    c="dimmed"
                                    className="hover:text-[#FE2C55] transition-colors"
                                >
                                    <IconMail size={16} />
                                </ActionIcon>
                                <Text size="xs" c="dimmed">
                                    {t('contact.email')}
                                </Text>
                            </Group>
                        </Stack> */}
                    </Group>

                    <Divider color="#2d2d2d" />

                    {/* Bottom Section */}
                    <Group justify="space-between" align="center">
                        <Group align="center" gap={4}>
                            <Text size="xs" c="dimmed">
                                {t('bottom.copyright')}
                            </Text>
                            <IconHeart size={12} style={{ color: '#FE2C55' }} />
                            <Text size="xs" c="dimmed">
                                {t('bottom.forCreators')}
                            </Text>
                        </Group>

                        <Group gap="xs">
                            {/* <Text size="xs" c="dimmed">
                                {t('bottom.version')}
                            </Text> */}
                            {/* <Text size="xs" c="dimmed">
                                |
                            </Text> */}
                            {/* <Text size="xs" c="dimmed">
                                {t('bottom.languages')}
                            </Text> */}
                        </Group>
                    </Group>
                </Stack>
            </Container>
        </footer>
    );
};

export default Footer;