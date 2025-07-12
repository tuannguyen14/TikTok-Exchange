// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import LocaleSelector from '@/components/common/LocaleSelector'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  ArrowLeftRight, 
  Video, 
  User, 
  Settings,
  ChevronDown,
  Coins,
  TrendingUp,
  Loader2,
  LogIn,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useTikTok } from '@/hooks/useTikTok'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tiktokAvatar, setTikTokAvatar] = useState<string | null>(null)
  
  const t = useTranslations('Navigation')
  const locale = useLocale()
  const router = useRouter()
  
  // Use auth context
  const { 
    isAuthenticated, 
    loading, 
    profile, 
    signOut 
  } = useAuth()

  // Use TikTok hook
  const { fetchProfile } = useTikTok()

  // Fetch TikTok avatar when profile changes
  useEffect(() => {
    if (profile?.tiktok_username) {
      fetchProfile(profile.tiktok_username).then(data => {
        if (data?.user?.avatarMedium) {
          setTikTokAvatar(data.user.avatarMedium)
        }
      })
    } else {
      setTikTokAvatar(null)
    }
  }, [profile?.tiktok_username, fetchProfile])

  // Handle logout
  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push(`/${locale}/auth/login`)
    }
  }

  const navigationItems = [
    { 
      key: 'dashboard', 
      icon: Home, 
      href: `/${locale}/dashboard`,
      label: t('dashboard'),
      authRequired: true
    },
    { 
      key: 'exchange', 
      icon: ArrowLeftRight, 
      href: `/${locale}/exchange`,
      label: t('exchange'),
      authRequired: true
    },
    { 
      key: 'videos', 
      icon: Video, 
      href: `/${locale}/videos`,
      label: t('myVideos'),
      authRequired: true
    },
    { 
      key: 'profile', 
      icon: User, 
      href: `/${locale}/profile`,
      label: t('profile'),
      authRequired: true
    }
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
              TikGrow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleNavItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#FE2C55] dark:text-gray-300 dark:hover:text-[#25F4EE] transition-colors duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Credits, Language, Profile/Auth */}
          <div className="flex items-center space-x-4">
            {/* Credits Display - Only show when authenticated */}
            {isAuthenticated && profile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-1.5 rounded-full"
              >
                <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  {profile.credits?.toLocaleString() || 0}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {t('credits')}
                </Badge>
              </motion.div>
            )}

            {/* Language Selector */}
            <LocaleSelector variant="dropdown" showFlag={true} showName={false} size="sm" />

            {/* Auth Section */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500 hidden sm:inline">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              /* User Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getAvatarSrc()} alt={profile?.email || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 border-b">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {profile?.email || 'User'}
                    </div>
                    {profile?.tiktok_username && (
                      <div className="text-xs text-[#FE2C55]">@{profile.tiktok_username}</div>
                    )}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>{t('settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth Buttons for Guest Users */
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link href={`/${locale}/auth/login`}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55]"
                >
                  <Link href={`/${locale}/auth/login`}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Đăng ký
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4"
            >
              <div className="flex flex-col space-y-3">
                {/* Mobile Credits Display */}
                {isAuthenticated && profile && (
                  <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        {profile.credits.toLocaleString()} {t('credits')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Items */}
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-[#FE2C55] hover:bg-red-50 dark:text-gray-300 dark:hover:text-[#25F4EE] dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-2 px-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start"
                    >
                      <Link href={`/${locale}/auth/login`}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full justify-start bg-gradient-to-r from-[#FE2C55] to-[#FF4081]"
                    >
                      <Link href={`/${locale}/auth/register`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Đăng ký
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}