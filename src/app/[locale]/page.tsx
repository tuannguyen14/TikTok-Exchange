'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from 'next-intl';
export default function HomePage() {
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return;

  }, [user, authLoading])

  const t = useTranslations('HomePage');
  return (
    <div>
      {user ? <h1>{t('title')}</h1> : <h1>{t('title')}</h1>}
    </div>
  );
}