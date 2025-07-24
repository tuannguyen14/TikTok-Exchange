// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/supabase-server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Routes that require authentication
const PROTECTED_ROUTES = [
  // '/dashboard',
  '/exchange', 
  '/campaigns',
  '/profile',
]

// Routes that should redirect authenticated users (login/register pages)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
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
  localePrefix: 'always',
})

// Helper function to check if path is protected
function isProtectedRoute(pathname: string): boolean {
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
  const localeFromPath = getLocaleFromPathname(request.nextUrl.pathname)
  if (localeFromPath) {
    return localeFromPath
  }

  const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeFromCookie && routing.locales.includes(localeFromCookie as any)) {
    return localeFromCookie
  }

  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q] = lang.trim().split(';q=')
        return { 
          code: code.split('-')[0],
          quality: q ? parseFloat(q) : 1.0 
        }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { code } of languages) {
      if (routing.locales.includes(code as any)) {
        return code
      }
    }
  }

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
    
    if (searchParams.toString()) {
      url.search = searchParams.toString()
    }
    
    return NextResponse.redirect(url)
  }

  // Create Supabase client for auth check
  const { supabase, response } = createMiddlewareClient(request)

  try {
    // Get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    const isAuthenticated = !!user && !error
    const isProtected = isProtectedRoute(pathname)
    const isAuth = isAuthRoute(pathname)

    console.log('Auth check:', { 
      pathname, 
      isAuthenticated, 
      isProtected, 
      isAuth, 
      user: user?.email || 'none',
      error: error?.message || 'none'
    })

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isAuth) {
      const locale = getLocaleFromPathname(pathname) || routing.defaultLocale
      const url = new URL(`/${locale}/exchange`, request.url)
      return NextResponse.redirect(url)
    }

    // FIX: Kiểm tra chặt chẽ hơn cho protected routes
    if (isProtected) {
      if (!isAuthenticated) {
        const locale = getLocaleFromPathname(pathname) || routing.defaultLocale
        const url = new URL(`/${locale}/auth/login`, request.url)
        
        const returnTo = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''))
        url.searchParams.set('returnTo', returnTo)
        
        console.log('Redirecting to login:', url.toString())
        return NextResponse.redirect(url)
      }
    }

    // Apply next-intl middleware for locale handling
    const intlResponse = intlMiddleware(request)
    
    if (intlResponse instanceof Response && intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse
    }

    // Set locale cookie for future requests
    const currentLocale = getLocaleFromPathname(pathname)
    if (currentLocale) {
      response.cookies.set('NEXT_LOCALE', currentLocale, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // FIX: Nếu có lỗi với auth, vẫn cần kiểm tra protected routes
    const isProtected = isProtectedRoute(pathname)
    
    if (isProtected) {
      // Nếu không thể xác thực và đang truy cập protected route
      // -> redirect về login
      const locale = getLocaleFromPathname(pathname) || routing.defaultLocale
      const url = new URL(`/${locale}/auth/login`, request.url)
      
      const returnTo = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''))
      url.searchParams.set('returnTo', returnTo)
      
      return NextResponse.redirect(url)
    }
    
    // Nếu không phải protected route, tiếp tục với intl middleware
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
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|images|icons|sounds|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|mp3|mp4|json)).*)',
  ],
}