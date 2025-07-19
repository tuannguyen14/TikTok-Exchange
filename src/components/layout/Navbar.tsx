// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  Badge,
  Burger,
  Container,
  Paper,
  Stack,
  Divider,
  UnstyledButton,
  Box,
  Flex,
  Loader,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconArrowsLeftRight,
  IconVideo,
  IconUser,
  IconSettings,
  IconChevronDown,
  IconCoins,
  IconTrendingUp,
  IconLogin,
  IconUserPlus,
  IconLogout,
} from '@tabler/icons-react'
import LocaleSelector from '@/components/common/LocaleSelector'
import { useAuth } from '@/hooks/useAuth'
import { useTikTokApi } from '@/hooks/useTikTok'
import classes from './Navbar.module.css'

export default function Navbar() {
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] = useDisclosure(false)
  const [tiktokAvatar, setTikTokAvatar] = useState<string | null>(null)

  const t = useTranslations('Navigation')
  const locale = useLocale()
  const router = useRouter()

  // Use auth context with realtime credits
  const {
    isAuthenticated,
    loading,
    profile,
    signOut,
    realtimeCredits
  } = useAuth()

  // Use TikTok hook
  const { getProfile } = useTikTokApi()

  // Fetch TikTok avatar when profile changes
  useEffect(() => {
    if (profile?.tiktok_username) {
      getProfile(profile.tiktok_username).then(data => {
        if (data?.data?.user?.avatarMedium) {
          setTikTokAvatar(data.data.user.avatarMedium)
        }
      })
    } else {
      setTikTokAvatar(null)
    }
  }, [profile?.tiktok_username, getProfile])

  // Handle logout
  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push(`/${locale}/auth/login`)
    }
  }

  const navigationItems = [
    {
      key: 'exchange',
      icon: IconArrowsLeftRight,
      href: `/${locale}/exchange`,
      label: t('exchange'),
      authRequired: true
    },
    {
      key: 'videos',
      icon: IconVideo,
      href: `/${locale}/campaigns`,
      label: t('myCampaigns'),
      authRequired: true
    },
    {
      key: 'profile',
      icon: IconUser,
      href: `/${locale}/profile`,
      label: t('profile'),
      authRequired: true
    }
  ]

  // Filter navigation items based on auth status
  const visibleNavItems = navigationItems.filter(item =>
    !item.authRequired || isAuthenticated
  )

  const getAvatarSrc = () => {
    if (tiktokAvatar) {
      return tiktokAvatar
    }
    return undefined // Will show fallback icon
  }

  return (
    <>
      <Paper className={classes.header} component="nav">
        <Container size="xl" h={70}>
          <Flex justify="space-between" align="center" h="100%">
            {/* Logo */}
            <UnstyledButton
              component={Link}
              href={`/${locale}`}
              className={classes.logoButton}
            >
              <Group gap="sm">
                <Box className={classes.logoIcon}>
                  <IconTrendingUp size={20} stroke={2} color="white" />
                </Box>
                <Text
                  size="xl"
                  fw={700}
                  variant="gradient"
                  gradient={{ from: '#FE2C55', to: '#25F4EE', deg: 45 }}
                >
                  TikGrow
                </Text>
              </Group>
            </UnstyledButton>

            {/* Desktop Navigation */}
            <Group gap="lg" visibleFrom="md">
              {visibleNavItems.map((item) => (
                <UnstyledButton
                  key={item.key}
                  component={Link}
                  href={item.href}
                  className={classes.navLink}
                >
                  <Group gap="xs">
                    <item.icon size={16} stroke={1.5} />
                    <Text size="sm" fw={500}>{item.label}</Text>
                  </Group>
                </UnstyledButton>
              ))}
            </Group>

            {/* Right Side - Credits, Language, Profile/Auth */}
            <Group gap="sm">
              {/* Credits Display - Only show when authenticated */}
              {isAuthenticated && profile && (
                <Paper
                  className={classes.creditsContainer}
                  visibleFrom="sm"
                >
                  <Group gap="xs">
                    <IconCoins size={16} className={classes.coinsIcon} />
                    <Text size="sm" fw={600} className={classes.creditsText}>
                      {realtimeCredits.toLocaleString()}
                    </Text>
                    <Badge size="xs" variant="light" color="yellow">
                      {t('credits')}
                    </Badge>
                  </Group>
                </Paper>
              )}

              {/* Language Selector */}
              <LocaleSelector variant="dropdown" showFlag={true} showName={false} size="sm" />

              {/* Auth Section */}
              {loading ? (
                <Group gap="xs">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed" visibleFrom="sm">Loading...</Text>
                </Group>
              ) : isAuthenticated ? (
                /* User Profile Menu */
                <Menu shadow="lg" width={200} position="bottom-end">
                  <Menu.Target>
                    <UnstyledButton className={classes.userButton}>
                      <Group gap="xs">
                        <Avatar
                          src={getAvatarSrc()}
                          size="sm"
                          radius="xl"
                          className={classes.avatar}
                        >
                          <IconUser size={16} />
                        </Avatar>
                        <IconChevronDown size={12} stroke={1.5} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>
                          {profile?.email || 'User'}
                        </Text>
                        {profile?.tiktok_username && (
                          <Text size="xs" c="#FE2C55">
                            @{profile.tiktok_username}
                          </Text>
                        )}
                      </Stack>
                    </Menu.Label>
                    <Menu.Divider />
                    <Menu.Item
                      component={Link}
                      href={`/${locale}/profile`}
                      leftSection={<IconUser size={16} />}
                    >
                      {t('profile')}
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      href={`/${locale}/profile`}
                      leftSection={<IconSettings size={16} />}
                    >
                      {t('settings')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={16} />}
                      onClick={handleLogout}
                    >
                      {t('logout')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                /* Auth Buttons for Guest Users */
                <Group gap="xs" visibleFrom="sm">
                  <Button
                    variant="subtle"
                    leftSection={<IconLogin size={16} />}
                    component={Link}
                    href={`/${locale}/auth/login`}
                    size="sm"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    gradient={{ from: '#FE2C55', to: '#FF4081' }}
                    leftSection={<IconUserPlus size={16} />}
                    component={Link}
                    href={`/${locale}/auth/login`}
                    size="sm"
                  >
                    Đăng ký
                  </Button>
                </Group>
              )}

              {/* Mobile Menu Button */}
              <Burger
                opened={mobileMenuOpened}
                onClick={toggleMobileMenu}
                size="sm"
                hiddenFrom="md"
                color="var(--mantine-color-gray-6)"
              />
            </Group>
          </Flex>
        </Container>
      </Paper>

      {/* Mobile Menu */}
      {mobileMenuOpened && (
        <Paper
          className={classes.mobileMenu}
          hiddenFrom="md"
          shadow="lg"
        >
          <Container size="xl" py="md">
            <Stack gap="sm">
              {/* Mobile Credits Display */}
              {isAuthenticated && profile && (
                <Paper className={classes.mobileCredits}>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconCoins size={16} className={classes.coinsIcon} />
                      <Text size="sm" fw={600} className={classes.creditsText}>
                        {realtimeCredits.toLocaleString()} {t('credits')}
                      </Text>
                    </Group>
                  </Group>
                </Paper>
              )}

              {/* Mobile Navigation Items */}
              {visibleNavItems.map((item) => (
                <UnstyledButton
                  key={item.key}
                  component={Link}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={classes.mobileNavLink}
                >
                  <Group gap="sm">
                    <item.icon size={20} stroke={1.5} />
                    <Text fw={500}>{item.label}</Text>
                  </Group>
                </UnstyledButton>
              ))}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <>
                  <Divider my="sm" />
                  <Stack gap="xs">
                    <Button
                      variant="outline"
                      leftSection={<IconLogin size={16} />}
                      component={Link}
                      href={`/${locale}/auth/login`}
                      fullWidth
                      onClick={closeMobileMenu}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      gradient={{ from: '#FE2C55', to: '#FF4081' }}
                      leftSection={<IconUserPlus size={16} />}
                      component={Link}
                      href={`/${locale}/auth/login`}
                      fullWidth
                      onClick={closeMobileMenu}
                    >
                      Đăng ký
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </Container>
        </Paper>
      )}
    </>
  )
}