// src/components/common/LocaleSelector.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import {
  Button,
  Menu,
  Group,
  Text,
  Stack,
  Indicator,
} from '@mantine/core'
import {
  IconWorld,
  IconChevronDown,
} from '@tabler/icons-react'
import classes from './LocaleSelector.module.css'

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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
      <Group gap={4} className={classes.buttonGroup}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={locale === language.code ? 'filled' : 'subtle'}
            size={size}
            onClick={() => handleLocaleChange(language.code)}
            className={locale === language.code ? classes.activeButton : classes.inactiveButton}
            fw={600}
          >
            <Group gap="xs">
              {showFlag && <Text component="span">{language.flag}</Text>}
              {showName && (
                <Text size="xs" fw={600}>
                  {language.code.toUpperCase()}
                </Text>
              )}
            </Group>
          </Button>
        ))}
      </Group>
    )
  }

  return (
    <Menu shadow="lg" width={220} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          size={size}
          className={classes.triggerButton}
          fw={500}
          rightSection={<IconChevronDown size={12} stroke={1.5} />}
        >
          <Group gap="xs">
            <IconWorld size={16} stroke={1.5} />
            {showFlag && (
              <Text component="span" className={classes.flagText}>
                {currentLanguage?.flag}
              </Text>
            )}
            {showName && (
              <Text size="sm" className={classes.nameText}>
                {currentLanguage?.nativeName}
              </Text>
            )}
          </Group>
        </Button>
      </Menu.Target>
      
      <Menu.Dropdown className={classes.dropdown}>
        <Menu.Label>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            Select Language
          </Text>
        </Menu.Label>
        
        {languages.map((language) => (
          <Menu.Item
            key={language.code}
            onClick={() => handleLocaleChange(language.code)}
            className={locale === language.code ? classes.activeItem : classes.menuItem}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm">
                <Text component="span" size="lg">
                  {language.flag}
                </Text>
                <Stack gap={2}>
                  <Text size="sm" fw={500}>
                    {language.nativeName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {language.name}
                  </Text>
                </Stack>
              </Group>
              
              {locale === language.code && (
                <Indicator
                  inline
                  size={8}
                  color="blue"
                  processing={false}
                />
              )}
            </Group>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
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