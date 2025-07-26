// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/supabase-server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Configuration constants
const CONFIG = {
  HOME_PATH: '/tiktok-exchange-followers-likes',
  DEFAULT_AUTH_REDIRECT: '/get-tiktok-followers-likes',
} as const

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/get-tiktok-followers-likes',
  '/campaigns',
  '/profile',
] as const

// Routes that should redirect authenticated users (login/register pages)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
] as const

// Routes and patterns that should be excluded from middleware processing
const EXCLUDED_PATTERNS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/images',
  '/icons',
  '/sounds',
] as const

// File extensions to exclude
const EXCLUDED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'svg', 'webp', 'ico',
  'css', 'js', 'mp3', 'mp4', 'json'
] as const

// Create the next-intl middleware with optimized config
const intlMiddleware = createIntlMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: 'always',
})

/**
 * Extract locale from pathname
 * Returns null if no valid locale found
 */
function extractLocale(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  return firstSegment && routing.locales.includes(firstSegment as any)
    ? firstSegment
    : null
}

/**
 * Remove locale prefix from pathname
 */
function stripLocale(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
  return withoutLocale || '/'
}

/**
 * Check if path should be excluded from middleware processing
 */
function shouldExcludeFromMiddleware(pathname: string): boolean {
  // Check excluded patterns
  if (EXCLUDED_PATTERNS.some(pattern => pathname.startsWith(pattern))) {
    return true
  }

  // Check file extensions
  const extension = pathname.split('.').pop()?.toLowerCase()
  if (extension && EXCLUDED_EXTENSIONS.includes(extension as any)) {
    return true
  }

  return false
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const pathWithoutLocale = stripLocale(pathname)
  return PROTECTED_ROUTES.some(route =>
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  )
}

/**
 * Check if route is auth-related (login/register)
 */
function isAuthRoute(pathname: string): boolean {
  const pathWithoutLocale = stripLocale(pathname)
  return AUTH_ROUTES.some(route =>
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  )
}

/**
 * Detect preferred locale from request
 */
function detectPreferredLocale(request: NextRequest): string {
  // 1. Check URL path
  const localeFromPath = extractLocale(request.nextUrl.pathname)
  if (localeFromPath) {
    return localeFromPath
  }

  // 2. Check cookie
  const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeFromCookie && routing.locales.includes(localeFromCookie as any)) {
    return localeFromCookie
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality = '1.0'] = lang.trim().split(';q=')
        return {
          code: code.split('-')[0].toLowerCase(),
          quality: parseFloat(quality)
        }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { code } of preferredLanguages) {
      if (routing.locales.includes(code as any)) {
        return code
      }
    }
  }

  return routing.defaultLocale
}

/**
 * Create URL with locale prefix
 */
function createLocalizedUrl(request: NextRequest, path: string, locale?: string): URL {
  const targetLocale = locale || detectPreferredLocale(request)
  const url = new URL(`/${targetLocale}${path}`, request.url)

  // Preserve search params
  const searchParams = request.nextUrl.searchParams.toString()
  if (searchParams) {
    url.search = searchParams
  }

  return url
}

/**
 * Handle authentication check and redirects
 */
async function handleAuthenticationFlow(
  request: NextRequest,
  pathname: string,
  supabase: any
): Promise<NextResponse | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    const isAuthenticated = !!user && !error
    const isProtected = isProtectedRoute(pathname)
    const isAuth = isAuthRoute(pathname)
    const currentLocale = extractLocale(pathname) || routing.defaultLocale

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth flow:', {
        pathname: stripLocale(pathname),
        isAuthenticated,
        isProtected,
        isAuth,
        user: user?.email || 'anonymous',
        locale: currentLocale
      })
    }

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuth) {
      const redirectUrl = createLocalizedUrl(request, CONFIG.DEFAULT_AUTH_REDIRECT, currentLocale)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect unauthenticated users from protected routes
    if (isProtected && !isAuthenticated) {
      const loginUrl = createLocalizedUrl(request, '/auth/login', currentLocale)

      // Add return URL for post-login redirect
      const returnPath = pathname + (request.nextUrl.search || '')
      loginUrl.searchParams.set('returnTo', encodeURIComponent(returnPath))

      return NextResponse.redirect(loginUrl)
    }

    return null // Continue processing

  } catch (error) {
    console.error('Authentication error:', error)

    // On auth error, redirect protected routes to login
    if (isProtectedRoute(pathname)) {
      const currentLocale = extractLocale(pathname) || routing.defaultLocale
      const loginUrl = createLocalizedUrl(request, '/auth/login', currentLocale)

      const returnPath = pathname + (request.nextUrl.search || '')
      loginUrl.searchParams.set('returnTo', encodeURIComponent(returnPath))

      return NextResponse.redirect(loginUrl)
    }

    return null // Continue with intl middleware
  }
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip processing for excluded routes and static files
  if (shouldExcludeFromMiddleware(pathname)) {
    return NextResponse.next()
  }

  // Handle root path redirect to home
  if (pathname === '/') {
    const homeUrl = createLocalizedUrl(request, CONFIG.HOME_PATH)
    return NextResponse.redirect(homeUrl)
  }

  // Handle paths without locale prefix
  const currentLocale = extractLocale(pathname)
  if (!currentLocale) {
    const localizedUrl = createLocalizedUrl(request, pathname)
    return NextResponse.redirect(localizedUrl)
  }

  // Create Supabase client for authentication
  const { supabase, response } = createMiddlewareClient(request)

  // Handle authentication flow
  const authResult = await handleAuthenticationFlow(request, pathname, supabase)
  if (authResult) {
    return authResult
  }

  // Apply internationalization middleware
  const intlResponse = intlMiddleware(request)
  if (intlResponse instanceof Response && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse
  }

  // Set locale cookie for future requests
  if (currentLocale) {
    response.cookies.set('NEXT_LOCALE', currentLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }

  return response
}

// Optimized matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes (/api/*)
     * - Next.js internals (/_next/*)
     * - Static files (favicon.ico, robots.txt, etc.)
     * - Public assets (/images/*, /icons/*, /sounds/*)
     * - Files with common extensions
     */
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|images|icons|sounds|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|mp3|mp4|json)).*)',
  ],
}