'use server';
// src/app/[locale]/campaigns/page.tsx
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import CampaignsClient from './components/CampaignsClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';


export default async function CampaignsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Server-side translations for initial render
  const t = await getTranslations({ locale, namespace: 'Campaigns' });

  const serverTranslations = {
    title: t('title'),
    description: t('description'),
    stats: {
      total: t('stats.total'),
      active: t('stats.active'),
      completed: t('stats.completed'),
      paused: t('stats.paused'),
      creditsSpent: t('stats.creditsSpent'),
      actionsReceived: t('stats.actionsReceived'),
    },
    tabs: {
      all: t('tabs.all'),
      video: t('tabs.video'),
      follow: t('tabs.follow'),
    },
    table: {
      type: t('table.type'),
      target: t('table.target'),
      interaction: t('table.interaction'),
      progress: t('table.progress'),
      creditsPerAction: t('table.creditsPerAction'),
      status: t('table.status'),
      created: t('table.created'),
      actions: t('table.actions'),
    },
    status: {
      active: t('status.active'),
      paused: t('status.paused'),
      completed: t('status.completed'),
      expired: t('status.expired'),
    },
    actions: {
      pause: t('actions.pause'),
      resume: t('actions.resume'),
      edit: t('actions.edit'),
      delete: t('actions.delete'),
      view: t('actions.view'),
    },
    buttons: {
      createCampaign: t('buttons.createCampaign'),
      filter: t('buttons.filter'),
      refresh: t('buttons.refresh'),
    },
    empty: {
      title: t('empty.title'),
      description: t('empty.description'),
      action: t('empty.action'),
    },
    deleteConfirm: {
      title: t('deleteConfirm.title'),
      description: t('deleteConfirm.description'),
      confirm: t('deleteConfirm.confirm'),
      cancel: t('deleteConfirm.cancel'),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {serverTranslations.title}
        </h1>
        <p className="text-gray-600">
          {serverTranslations.description}
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <CampaignsClient
          locale={locale}
          serverTranslations={serverTranslations}
        />
      </Suspense>
    </div>
  );
}