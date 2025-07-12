// src/components/common/LocaleSelector.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, ChevronDown } from 'lucide-react'
import { removeLocaleFromPathname } from '@/lib/utils/routing'

interface Language {
  code: Locale
  name: string
  flag: string
  nativeName: string
}

const languages: Language[] = [
  { 
    code: 'vi', 
    name: 'Vietnamese', 
    flag: '🇻🇳', 
    nativeName: 'Tiếng Việt' 
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸', 
    nativeName: 'English' 
  }
]

interface LocaleSelectorProps {
  variant?: 'dropdown' | 'buttons'
  showFlag?: boolean
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LocaleSelector({ 
  variant = 'dropdown',
  showFlag = true,
  showName = true,
  size = 'md'
}: LocaleSelectorProps) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  const currentLanguage = languages.find(lang => lang.code === locale)

  const handleLocaleChange = (newLocale: Locale) => {
    // Use next-intl's router to switch locale while preserving pathname
    router.push(pathname, { locale: newLocale })
    
    // Also set cookie for server-side detection
    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
  }

  if (variant === 'buttons') {
    return (
      <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={locale === language.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLocaleChange(language.code)}
            className={`h-8 px-3 ${
              locale === language.code 
                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            {showFlag && <span className="mr-1">{language.flag}</span>}
            {showName && (
              <span className="text-xs font-medium">
                {language.code.toUpperCase()}
              </span>
            )}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="lg" 
          className="flex items-center space-x-2"
        >
          <Globe className="w-4 h-4" />
          {showFlag && (
            <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          )}
          {showName && (
            <span className="hidden md:inline text-sm">
              {currentLanguage?.nativeName}
            </span>
          )}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLocaleChange(language.code)}
            className={`flex items-center space-x-3 cursor-pointer ${
              locale === language.code 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-gray-500">{language.name}</span>
            </div>
            {locale === language.code && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Hook to get current language info
export function useCurrentLanguage() {
  const locale = useLocale() as Locale
  return languages.find(lang => lang.code === locale)
}

// Hook to check if locale is supported
export function useLocaleValidation() {
  const locale = useLocale()
  
  return {
    isValidLocale: routing.locales.includes(locale as Locale),
    supportedLocales: routing.locales,
    currentLocale: locale as Locale,
    defaultLocale: routing.defaultLocale
  }
}