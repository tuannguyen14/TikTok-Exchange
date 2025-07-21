'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/loading/loading-spinner';

// Lazy load components for better performance
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  loading: () => <LoadingSpinner />,
  ssr: true
});

const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), {
  loading: () => <div className="h-32" />,
  ssr: true
});

const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), {
  loading: () => <div className="h-96" />,
  ssr: false
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection'), {
  loading: () => <div className="h-96" />,
  ssr: false
});

const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), {
  loading: () => <div className="h-96" />,
  ssr: false
});

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), {
  loading: () => <div className="h-96" />,
  ssr: false
});

const FAQSection = dynamic(() => import('@/components/landing/FAQSection'), {
  loading: () => <div className="h-96" />,
  ssr: false
});

const CTASection = dynamic(() => import('@/components/landing/CTASection'), {
  loading: () => <div className="h-64" />,
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render landing page if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}