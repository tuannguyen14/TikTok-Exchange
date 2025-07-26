// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/contexts/auth-context';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikGrow - TikTok Engagement Exchange Platform",
  description: "Boost your TikTok engagement by interacting with others. Earn credits and grow your audience.",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error('Không tìm thấy messages cho locale:', locale);
    notFound();
  }

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider >
          <Notifications position="top-center" zIndex={9999} />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Navbar />
                <main>
                  {children}
                  <Analytics />
                  <SpeedInsights />
                </main>
              </div>
            </AuthProvider>
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}