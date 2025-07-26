// src/lib/utils/routing.ts
import { routing } from '@/i18n/routing'

/**
 * Get the locale from a pathname
 */
export function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && routing.locales.includes(firstSegment as any)) {
    return firstSegment
  }
  
  return null
}

/**
 * Remove locale prefix from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/'
  }
  return pathname
}

/**
 * Add locale prefix to pathname
 */
export function addLocaleToPathname(pathname: string, locale: string): string {
  // Remove existing locale if any
  const pathWithoutLocale = removeLocaleFromPathname(pathname)
  return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/get-tiktok-followers-likes', 
    '/campaigns',
    '/profile',
  ]
  
  const pathWithoutLocale = removeLocaleFromPathname(pathname)
  return protectedRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
  )
}

/**
 * Check if a route is an auth route (login/register)
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/auth/login',
    '/auth/login',
    '/auth/reset-password',
  ]
  
  const pathWithoutLocale = removeLocaleFromPathname(pathname)
  return authRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
  )
}

/**
 * Check if a route is public (doesn't require auth)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy',
  ]
  
  const pathWithoutLocale = removeLocaleFromPathname(pathname)
  return publicRoutes.includes(pathWithoutLocale)
}

/**
 * Get redirect URL after login
 */
export function getRedirectUrl(returnTo?: string, locale?: string): string {
  const defaultLocale = locale || routing.defaultLocale
  
  if (returnTo) {
    try {
      const decodedReturnTo = decodeURIComponent(returnTo)
      
      // Validate that returnTo is a safe internal URL
      if (decodedReturnTo.startsWith('/') && !decodedReturnTo.startsWith('//')) {
        // Ensure locale is included
        const localeFromPath = getLocaleFromPathname(decodedReturnTo)
        if (localeFromPath) {
          return decodedReturnTo
        } else {
          return addLocaleToPathname(decodedReturnTo, defaultLocale)
        }
      }
    } catch (error) {
      console.error('Invalid returnTo parameter:', error)
    }
  }
  
  // Default redirect to dashboard
  return `/${defaultLocale}/get-tiktok-followers-likes`
}

/**
 * Detect preferred locale from Accept-Language header
 */
export function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return routing.defaultLocale
  }

  try {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q] = lang.trim().split(';q=')
        return { 
          code: code.split('-')[0].toLowerCase(), // Get main language code (en from en-US)
          quality: q ? parseFloat(q) : 1.0 
        }
      })
      .sort((a, b) => b.quality - a.quality)

    // Find first matching locale
    for (const { code } of languages) {
      if (routing.locales.includes(code as any)) {
        return code
      }
    }
  } catch (error) {
    console.error('Error parsing Accept-Language header:', error)
  }

  return routing.defaultLocale
}

/**
 * Build URL with locale
 */
export function buildUrlWithLocale(
  path: string, 
  locale: string, 
  baseUrl?: string
): string {
  const url = new URL(addLocaleToPathname(path, locale), baseUrl || 'http://localhost:3000')
  return baseUrl ? url.toString() : url.pathname
}

/**
 * Navigation helper for client-side routing
 */
export function createLocalizedPath(path: string, currentLocale: string): string {
  // If path already has locale, return as is
  if (getLocaleFromPathname(path)) {
    return path
  }
  
  // Add current locale to path
  return addLocaleToPathname(path, currentLocale)
}