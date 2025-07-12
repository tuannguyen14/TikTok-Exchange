// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/supabase-server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/exchange', 
  '/campaigns',
  '/profile',
]

// Routes that should redirect authenticated users (login/register pages)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
]

// Public routes that don't need any protection
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/terms',
  '/privacy',
]

// API routes that should be excluded from middleware
const API_ROUTES = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: 'always', // Always show locale in URL
})

// Helper function to check if path is protected
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix to check the actual route
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
  return PROTECTED_ROUTES.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
  )
}

// Helper function to check if path is auth route
function isAuthRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
  return AUTH_ROUTES.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
  )
}

// Helper function to check if should skip middleware
function shouldSkipMiddleware(pathname: string): boolean {
  return API_ROUTES.some(route => pathname.startsWith(route))
}

// Helper function to get locale from pathname
function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && routing.locales.includes(firstSegment as any)) {
    return firstSegment
  }
  
  return null
}

// Helper function to detect locale from request
function detectLocale(request: NextRequest): string {
  // 1. Check if locale is in URL
  const localeFromPath = getLocaleFromPathname(request.nextUrl.pathname)
  if (localeFromPath) {
    return localeFromPath
  }

  // 2. Check locale from cookie
  const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeFromCookie && routing.locales.includes(localeFromCookie as any)) {
    return localeFromCookie
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q] = lang.trim().split(';q=')
        return { 
          code: code.split('-')[0], // Get main language code (en from en-US)
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
  }

  // 4. Default locale
  return routing.defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip middleware for API routes, static files, etc.
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next()
  }

  // Handle root path - redirect to default locale
  if (pathname === '/') {
    const locale = detectLocale(request)
    const url = new URL(`/${locale}`, request.url)
    
    // Preserve search params
    if (searchParams.toString()) {
      url.search = searchParams.toString()
    }
    
    return NextResponse.redirect(url)
  }

  // Handle paths without locale - redirect to add locale
  const localeFromPath = getLocaleFromPathname(pathname)
  if (!localeFromPath) {
    const locale = detectLocale(request)
    const url = new URL(`/${locale}${pathname}`, request.url)
    
    // Preserve search params
    if (searchParams.toString()) {
      url.search = searchParams.toString()
    }
    
    return NextResponse.redirect(url)
  }

  // Create Supabase client for auth check
  const { supabase, response } = createMiddlewareClient(request)

  try {
    // Get authenticated user (more secure than getSession)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    const isAuthenticated = !error && !!user
    const isProtected = isProtectedRoute(pathname)
    const isAuth = isAuthRoute(pathname)

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isAuth) {
      const locale = getLocaleFromPathname(pathname) || routing.defaultLocale
      const url = new URL(`/${locale}/dashboard`, request.url)
      return NextResponse.redirect(url)
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && isProtected) {
      const locale = getLocaleFromPathname(pathname) || routing.defaultLocale
      const url = new URL(`/${locale}/auth/login`, request.url)
      
      // Add redirect param to return to original page after login
      const returnTo = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''))
      url.searchParams.set('returnTo', returnTo)
      
      return NextResponse.redirect(url)
    }

    // Apply next-intl middleware for locale handling
    const intlResponse = intlMiddleware(request)
    
    // If intl middleware wants to redirect, return that response
    if (intlResponse instanceof Response && intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse
    }

    // Set locale cookie for future requests
    const currentLocale = getLocaleFromPathname(pathname)
    if (currentLocale) {
      response.cookies.set('NEXT_LOCALE', currentLocale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    // Return the response with potentially updated cookies
    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error with auth, continue with intl middleware
    return intlMiddleware(request)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|icons|sounds).*)',
  ],
}