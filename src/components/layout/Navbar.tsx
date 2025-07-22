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
import { useTikTokApi } from '@/hooks/useTikTok'
import classes from './Navbar.module.css'
import Image from 'next/image';

// Key cho localStorage
const TIKTOK_AVATAR_STORAGE_KEY = 'tiktok_avatars'
const AVATAR_CACHE_DURATION = 1 * 24 * 60 * 60 * 1000 // 7 ngày (ms)

// Interface cho cached avatar
interface CachedAvatar {
  url: string
  timestamp: number
  username: string
}

// Interface cho avatar cache storage
interface AvatarCache {
  [username: string]: CachedAvatar
}

// Helper functions cho localStorage
const getAvatarFromStorage = (username: string): string | null => {
  try {
    const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY)
    if (!stored) return null

    const cache: AvatarCache = JSON.parse(stored)
    const cachedAvatar = cache[username]

    if (!cachedAvatar) return null

    // Kiểm tra thời gian hết hạn
    const now = Date.now()
    if (now - cachedAvatar.timestamp > AVATAR_CACHE_DURATION) {
      // Xóa avatar đã hết hạn
      delete cache[username]
      localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache))
      return null
    }

    return cachedAvatar.url
  } catch (error) {
    console.error('Error reading avatar from localStorage:', error)
    return null
  }
}

const saveAvatarToStorage = (username: string, avatarUrl: string): void => {
  try {
    const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY)
    let cache: AvatarCache = {}

    if (stored) {
      cache = JSON.parse(stored)
    }

    // Lưu avatar với timestamp
    cache[username] = {
      url: avatarUrl,
      timestamp: Date.now(),
      username
    }

    // Giới hạn số lượng avatar trong cache (tối đa 50)
    const cacheEntries = Object.entries(cache)
    if (cacheEntries.length > 50) {
      // Sắp xếp theo timestamp và giữ lại 40 avatar mới nhất
      const sortedEntries = cacheEntries.sort((a, b) => b[1].timestamp - a[1].timestamp)
      const limitedCache: AvatarCache = {}

      sortedEntries.slice(0, 40).forEach(([key, value]) => {
        limitedCache[key] = value
      })

      cache = limitedCache
    }

    localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error saving avatar to localStorage:', error)
  }
}

const clearExpiredAvatars = (): void => {
  try {
    const stored = localStorage.getItem(TIKTOK_AVATAR_STORAGE_KEY)
    if (!stored) return

    const cache: AvatarCache = JSON.parse(stored)
    const now = Date.now()
    let hasExpired = false

    Object.keys(cache).forEach(username => {
      if (now - cache[username].timestamp > AVATAR_CACHE_DURATION) {
        delete cache[username]
        hasExpired = true
      }
    })

    if (hasExpired) {
      localStorage.setItem(TIKTOK_AVATAR_STORAGE_KEY, JSON.stringify(cache))
    }
  } catch (error) {
    console.error('Error clearing expired avatars:', error)
  }
}

export default function Navbar() {
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] = useDisclosure(false)
  const [tiktokAvatar, setTikTokAvatar] = useState<string | null>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)

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

  // Clear expired avatars khi component mount
  useEffect(() => {
    clearExpiredAvatars()
  }, [])

  // Fetch TikTok avatar when profile changes
  useEffect(() => {
    if (!profile?.tiktok_username) {
      setTikTokAvatar(null)
      return
    }

    const username = profile.tiktok_username

    // Thử lấy từ localStorage trước
    const cachedAvatar = getAvatarFromStorage(username)
    if (cachedAvatar) {
      setTikTokAvatar(cachedAvatar)
      return
    }

    // Nếu không có trong cache, fetch từ API
    setIsLoadingAvatar(true)
    getProfile(username)
      .then(data => {
        if (data?.data?.user?.avatarMedium) {
          const avatarUrl = data.data.user.avatarMedium
          setTikTokAvatar(avatarUrl)
          // Lưu vào localStorage
          saveAvatarToStorage(username, avatarUrl)
        }
      })
      .catch(error => {
        console.error('Error fetching TikTok avatar:', error)
      })
      .finally(() => {
        setIsLoadingAvatar(false)
      })
  }, [profile?.tiktok_username, getProfile])

  // Handle logout
  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      // Clear avatar khi logout (tùy chọn)
      setTikTokAvatar(null)
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

                <Image
                  src={"/logo.png"}
                  alt="Logo"
                  width={35}
                  height={35}
                  style={{ borderRadius: '50%' }}
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

              {/* Language Selector with enhanced styling */}
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
                /* User Profile Menu */
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
                          {/* Loading indicator cho avatar */}
                          {isLoadingAvatar && (
                            <Box
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: '50%',
                              }}
                            >
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
              ) : (
                /* Auth Buttons for Guest Users */
                <Group gap="xs" visibleFrom="sm" className={classes.authButtons}>
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
        </Paper>
      )}
    </>
  )
}