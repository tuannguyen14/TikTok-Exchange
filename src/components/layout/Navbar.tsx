// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
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
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconArrowsLeftRight,
  IconVideo,
  IconUser,
  IconSettings,
  IconChevronDown,
  IconCoins,
  IconLogin,
  IconUserPlus,
  IconLogout,
} from '@tabler/icons-react'
import LocaleSelector from '@/components/common/LocaleSelector'
import { useAuth } from '@/hooks/useAuth'
import classes from './Navbar.module.css'
import Image from 'next/image'
import { useProfile } from '@/hooks/useProfile'

// Memo navigation items to prevent recreation
const NavigationItem = memo(({ item, onClick }: {
  item: { key: string; icon: any; href: string; label: string };
  onClick?: () => void
}) => (
  <UnstyledButton
    component={Link}
    href={item.href}
    className={classes.navLink}
    onClick={onClick}
  >
    <Group gap="xs">
      <item.icon size={16} stroke={1.5} />
      <Text size="sm" fw={500}>{item.label}</Text>
    </Group>
  </UnstyledButton>
))

NavigationItem.displayName = 'NavigationItem'

// Memo mobile navigation item
const MobileNavigationItem = memo(({ item, onClick }: {
  item: { key: string; icon: any; href: string; label: string };
  onClick: () => void
}) => (
  <UnstyledButton
    component={Link}
    href={item.href}
    onClick={onClick}
    className={classes.mobileNavLink}
  >
    <Group gap="sm">
      <item.icon size={20} stroke={1.5} />
      <Text fw={500}>{item.label}</Text>
    </Group>
  </UnstyledButton>
))

MobileNavigationItem.displayName = 'MobileNavigationItem'

// Memo credits component
const CreditsDisplay = memo(({ credits, t, isMobile = false }: {
  credits: number;
  t: any;
  isMobile?: boolean
}) => (
  <Paper className={isMobile ? classes.mobileCredits : classes.creditsContainer}>
    <Group gap="xs" justify={isMobile ? "space-between" : "center"}>
      <Group gap="xs">
        <IconCoins size={16} className={classes.coinsIcon} />
        <Text size="sm" fw={600} className={classes.creditsText}>
          {credits.toLocaleString()} {isMobile ? t('credits') : ''}
        </Text>
        {!isMobile && (
          <Badge size="xs" variant="light" color="yellow">
            {t('credits')}
          </Badge>
        )}
      </Group>
    </Group>
  </Paper>
))

CreditsDisplay.displayName = 'CreditsDisplay'

// Memo user menu
const UserMenu = memo(({
  profile,
  tiktokAvatar,
  profileLoading,
  t,
  locale,
  handleLogout
}: {
  profile: any;
  tiktokAvatar: string | null;
  profileLoading: boolean;
  t: any;
  locale: string;
  handleLogout: () => void;
}) => {
  const getAvatarSrc = useCallback(() => {
    return tiktokAvatar || undefined
  }, [tiktokAvatar])

  return (
    <Menu shadow="lg" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton className={classes.userButton}>
          <Group gap="xs">
            <Box style={{ position: 'relative' }}>
              <Avatar
                src={getAvatarSrc()}
                size="sm"
                radius="xl"
                className={classes.avatar}
              >
                <IconUser size={16} />
              </Avatar>
              {profileLoading && (
                <Box className={classes.avatarLoader}>
                  <Loader size="xs" color="white" />
                </Box>
              )}
            </Box>
            <IconChevronDown size={12} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className={classes.userMenuDropdown}>
        <Menu.Label>
          <Stack gap={2}>
            <Text size="sm" fw={600}>
              {profile?.email || 'User'}
            </Text>
            {profile?.tiktok_username && (
              <Text size="xs" c="#FE2C55" fw={500}>
                @{profile.tiktok_username}
              </Text>
            )}
          </Stack>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item
          component={Link}
          href={`/${locale}/profile`}
          leftSection={<IconUser size={16} stroke={1.5} />}
        >
          <Text fw={500}>{t('profile')}</Text>
        </Menu.Item>
        <Menu.Item
          component={Link}
          href={`/${locale}/profile`}
          leftSection={<IconSettings size={16} stroke={1.5} />}
        >
          <Text fw={500}>{t('settings')}</Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} stroke={1.5} />}
          onClick={handleLogout}
        >
          <Text fw={500}>{t('logout')}</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
})

UserMenu.displayName = 'UserMenu'

// Memo auth buttons
const AuthButtons = memo(({ locale, t, isMobile = false, onClick }: {
  locale: string;
  t: any;
  isMobile?: boolean;
  onClick?: () => void;
}) => {
  if (isMobile) {
    return (
      <Stack gap="xs">
        <Button
          variant="outline"
          leftSection={<IconLogin size={16} stroke={1.5} />}
          component={Link}
          href={`/${locale}/auth/login`}
          fullWidth
          onClick={onClick}
          fw={600}
        >
          Đăng nhập
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: '#FE2C55', to: '#FF4081' }}
          leftSection={<IconUserPlus size={16} stroke={1.5} />}
          component={Link}
          href={`/${locale}/auth/login`}
          fullWidth
          onClick={onClick}
          fw={600}
        >
          Đăng ký
        </Button>
      </Stack>
    )
  }

  return (
    <Group gap="xs" className={classes.authButtons}>
      <Button
        variant="subtle"
        leftSection={<IconLogin size={16} stroke={1.5} />}
        component={Link}
        href={`/${locale}/auth/login`}
        size="sm"
        fw={600}
      >
        Đăng nhập
      </Button>
      <Button
        variant="gradient"
        gradient={{ from: '#FE2C55', to: '#FF4081' }}
        leftSection={<IconUserPlus size={16} stroke={1.5} />}
        component={Link}
        href={`/${locale}/auth/login`}
        size="sm"
        fw={600}
      >
        Đăng ký
      </Button>
    </Group>
  )
})

AuthButtons.displayName = 'AuthButtons'

export default function Navbar() {
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] = useDisclosure(false)

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
  const { tiktokAvatar, clearAvatarCache, loading: profileLoading } = useProfile()

  // Memoize navigation items
  const navigationItems = useMemo(() => [
    {
      key: 'exchange',
      icon: IconArrowsLeftRight,
      href: `/${locale}/get-tiktok-followers-likes`,
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
  ], [locale, t])

  // Memoize visible navigation items
  const visibleNavItems = useMemo(() =>
    navigationItems.filter(item => !item.authRequired || isAuthenticated),
    [navigationItems, isAuthenticated]
  )

  // Handle logout with useCallback
  const handleLogout = useCallback(async () => {
    const { error } = await signOut()
    if (!error) {
      clearAvatarCache()
      router.push(`/${locale}/auth/login`)
    }
  }, [signOut, clearAvatarCache, router, locale])

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      closeMobileMenu()
    }

    // Listen for route changes (simplified)
    window.addEventListener('beforeunload', handleRouteChange)

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange)
    }
  }, [closeMobileMenu])

  return (
    <Box style={{ position: 'relative' }}>
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
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={35}
                  height={35}
                  style={{ borderRadius: '50%' }}
                  priority
                />
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
                <NavigationItem key={item.key} item={item} />
              ))}
            </Group>

            {/* Right Side - Credits, Language, Profile/Auth */}
            <Group gap="sm">
              {/* Credits Display - Only show when authenticated */}
              {isAuthenticated && profile && (
                <Box visibleFrom="sm">
                  <CreditsDisplay credits={realtimeCredits} t={t} />
                </Box>
              )}

              {/* Language Selector */}
              <LocaleSelector
                variant="dropdown"
                showFlag={true}
                showName={false}
                size="sm"
              />

              {/* Auth Section */}
              {loading ? (
                <Group gap="xs" className={classes.loadingContainer}>
                  <Loader size="sm" />
                  <Text size="sm" fw={500} visibleFrom="sm">Loading...</Text>
                </Group>
              ) : isAuthenticated ? (
                <UserMenu
                  profile={profile}
                  tiktokAvatar={tiktokAvatar}
                  profileLoading={profileLoading}
                  t={t}
                  locale={locale}
                  handleLogout={handleLogout}
                />
              ) : (
                <Box visibleFrom="sm">
                  <AuthButtons locale={locale} t={t} />
                </Box>
              )}

              {/* Mobile Menu Button */}
              <Burger
                opened={mobileMenuOpened}
                onClick={toggleMobileMenu}
                size="sm"
                hiddenFrom="md"
                color="var(--mantine-color-gray-6)"
                lineSize={2}
              />
            </Group>
          </Flex>
        </Container>
      </Paper>

      {/* Mobile Menu - Simplified version */}
      {mobileMenuOpened && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1001,
            background: 'white',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
          display={{ base: 'block', md: 'none' }}
        >
          <Container size="xl" py="md">
            <Stack gap="sm">

              {/* Mobile Credits Display */}
              {isAuthenticated && profile && (
                <Paper style={{
                  background: 'rgba(254, 242, 128, 0.15)',
                  border: '1px solid rgba(254, 242, 128, 0.3)',
                  padding: 'var(--mantine-spacing-sm)',
                  borderRadius: 'var(--mantine-radius-md)'
                }}>
                  <Group gap="xs" justify="space-between">
                    <Group gap="xs">
                      <IconCoins size={16} style={{ color: '#facc15' }} />
                      <Text size="sm" fw={600} style={{ color: '#a16207' }}>
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
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    width: '100%',
                    textAlign: 'left',
                    color: '#374151',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
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
                      leftSection={<IconLogin size={16} stroke={1.5} />}
                      component={Link}
                      href={`/${locale}/auth/login`}
                      fullWidth
                      onClick={closeMobileMenu}
                      fw={600}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="gradient"
                      gradient={{ from: '#FE2C55', to: '#FF4081' }}
                      leftSection={<IconUserPlus size={16} stroke={1.5} />}
                      component={Link}
                      href={`/${locale}/auth/login`}
                      fullWidth
                      onClick={closeMobileMenu}
                      fw={600}
                    >
                      Đăng ký
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  )
}