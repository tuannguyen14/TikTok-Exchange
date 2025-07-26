'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, LoadingOverlay } from '@mantine/core';

// Lazy load components for better performance
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  loading: () => <LoadingOverlay visible />,
  ssr: true
});

const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), {
  loading: () => <Box h={128} />,
  ssr: true
});

const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), {
  loading: () => <Box h={384} />,
  ssr: false
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection'), {
  loading: () => <Box h={384} />,
  ssr: false
});

const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), {
  loading: () => <Box h={384} />,
  ssr: false
});

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), {
  loading: () => <Box h={384} />,
  ssr: false
});

const FAQSection = dynamic(() => import('@/components/landing/FAQSection'), {
  loading: () => <Box h={384} />,
  ssr: false
});

const CTASection = dynamic(() => import('@/components/landing/CTASection'), {
  loading: () => <Box h={256} />,
  ssr: false
});

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/exchange');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LoadingOverlay visible />
      </Box>
    );
  }

  // Don't render landing page if user is authenticated
  if (user) {
    return null;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
      }}
    >
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </Box>
  );
}