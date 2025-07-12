// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'vi'],

  // Used when no locale matches
  defaultLocale: 'vi',
  
  // Optional: Configure the locale prefix strategy
  localePrefix: 'always', // Always show locale in URL (/vi/dashboard, /en/dashboard)
  
  // Optional: Configure pathnames for different locales
  pathnames: {
    '/': '/',
    '/dashboard': {
      en: '/dashboard',
      vi: '/dashboard'
    },
    '/exchange': {
      en: '/exchange',
      vi: '/exchange'
    },
    '/videos': {
      en: '/videos',
      vi: '/videos'
    },
    '/profile': {
      en: '/profile',
      vi: '/profile'
    },
    '/auth/login': {
      en: '/auth/login',
      vi: '/auth/login'
    },
    '/auth/register': {
      en: '/auth/register',
      vi: '/auth/register'
    }
  }
});

// Export types for TypeScript
export type Locale = typeof routing.locales[number];
export type Pathnames = typeof routing.pathnames;