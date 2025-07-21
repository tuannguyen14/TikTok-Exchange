// app/login/page.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Box,
  Alert,
  Anchor,
  Stack,
  SegmentedControl,
  List,
  ThemeIcon,
  Divider,
  Center,
  rem
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconTrendingUp,
  IconHeart,
  IconMessageCircle,
  IconUsers,
  IconPlayerPlay,
  IconCheck,
  IconExclamationCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import LoadingOverlay from '@/components/ui/loading/loading-overlay'

// Floating animation component
const FloatingIcon = React.memo(({
  icon: Icon,
  className,
  delay,
  color
}: {
  icon: React.ComponentType<any>;
  className: string;
  delay: number;
  color: string;
}) => (
  <Box
    className={`absolute opacity-20 ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: '3s',
      animation: 'pulse 3s infinite',
    }}
  >
    <Icon size={24} color={color} />
  </Box>
));

FloatingIcon.displayName = 'FloatingIcon';

const AnimatedBackground = React.memo(() => {
  const floatingIcons = useMemo(() => [
    { icon: IconHeart, className: "top-20 left-20", delay: 0, color: "#f783ac" },
    { icon: IconMessageCircle, className: "top-32 right-32", delay: 1, color: "#60a5fa" },
    { icon: IconUsers, className: "bottom-32 left-32", delay: 2, color: "#4ade80" },
    { icon: IconPlayerPlay, className: "bottom-20 right-20", delay: 3, color: "#a855f7" },
    { icon: IconTrendingUp, className: "top-1/2 left-10", delay: 1.5, color: "#facc15" },
    { icon: IconHeart, className: "top-1/3 right-10", delay: 2.5, color: "#ef4444" },
  ], []);

  return (
    <Box className="absolute inset-0 overflow-hidden">
      {floatingIcons.map((props, index) => (
        <FloatingIcon key={index} {...props} />
      ))}

      <Box
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        style={{
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          animation: 'pulse 4s infinite',
        }}
      />
      <Box
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          animation: 'pulse 4s infinite',
          animationDelay: '1s',
        }}
      />
    </Box>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

const LoginPage = () => {
  const t = useTranslations();
  const [isLogin, setIsLogin] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return t('Auth.errors.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('Auth.errors.invalidEmail');
        return null;
      },
      password: (value) => {
        if (!value) return t('Auth.errors.passwordRequired');
        if (value.length < 6) return t('Auth.errors.passwordTooShort');
        return null;
      },
    },
  });

  const handleSubmit = useCallback(async (values: typeof form.values) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const endpoint = isLogin === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: t('Common.success'),
          message: t(isLogin === 'login' ? 'Auth.login.success' : 'Auth.register.success'),
          color: 'green',
          icon: <IconCheck size={16} />,
          style: {
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#bbf7d0',
          },
        });
        window.location.href = '/exchange';
      } else {
        setGeneralError(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLogin, t]);

  const benefits = useMemo(() => [
    { icon: IconTrendingUp, text: t('Auth.register.benefits.1'), color: 'pink' },
    { icon: IconHeart, text: t('Auth.register.benefits.2'), color: 'blue' },
    { icon: IconUsers, text: t('Auth.register.benefits.3'), color: 'violet' },
  ], [t]);

  return (
    <Box
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
      }}
    >
      <AnimatedBackground />

      <Container size="sm" className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Paper
          shadow="xl"
          p="xl"
          radius="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            maxWidth: rem(500),
            position: 'relative',
          }}
        >

          {/* Logo & Brand */}
          <Stack align="center" mb="xl">
            <ThemeIcon
              size={60}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 135 }}
            >
              <IconTrendingUp size={30} />
            </ThemeIcon>

            <Title
              order={1}
              size="h1"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
              }}
            >
              TikGrow
            </Title>

            <Text size="md" c="dimmed" ta="center">
              {t(isLogin === 'login' ? 'Auth.login.description' : 'Auth.register.description')}
            </Text>
          </Stack>

          {/* Toggle Login/Register */}
          <SegmentedControl
            fullWidth
            value={isLogin}
            onChange={setIsLogin}
            data={[
              { label: t('Auth.login.title'), value: 'login' },
              { label: t('Auth.register.title'), value: 'register' },
            ]}
            mb="xl"
            radius="md"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          />

          {/* Error Alert */}
          {generalError && (
            <Alert
              icon={<IconExclamationCircle size={16} />}
              color="red"
              variant="filled"
              mb="md"
              radius="md"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fecaca',
              }}
            >
              {generalError}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                leftSection={<IconMail size={18} />}
                placeholder={t('Auth.login.email')}
                radius="md"
                size="md"
                style={{
                  input: {
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                }}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                leftSection={<IconLock size={18} />}
                placeholder={t('Auth.login.password')}
                radius="md"
                size="md"
                style={{
                  input: {
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                }}
                {...form.getInputProps('password')}
              />

              <Button
                type="submit"
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: 'pink', to: 'violet', deg: 135 }}
                loading={isLoading}
                style={{
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {t(isLogin === 'login' ? 'Auth.login.submit' : 'Auth.register.submit')}
              </Button>
            </Stack>
          </form>

          {/* Forgot Password */}
          {isLogin === 'login' && (
            <Center mt="md">
              <Anchor
                size="sm"
                c="pink"
                href="#"
                style={{ textDecoration: 'none' }}
              >
                {t('Auth.login.forgotPassword')}
              </Anchor>
            </Center>
          )}

          {/* Benefits Section */}
          {isLogin === 'register' && (
            <Box mt="xl" pt="xl" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Text fw={500} c="white" mb="md">
                🎉 {t('Auth.register.benefits.0')}
              </Text>
              <List
                spacing="xs"
                size="sm"
                c="dimmed"
                icon={
                  <ThemeIcon color="pink" size={16} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                {benefits.map((benefit, index) => (
                  <List.Item key={index}>
                    {benefit.text}
                  </List.Item>
                ))}
              </List>
            </Box>
          )}

          {/* Toggle Text */}
          <Divider my="xl" color="rgba(255, 255, 255, 0.1)" />

          <Center>
            <Text size="sm" c="dimmed">
              {isLogin === 'login' ? (
                <>
                  {t('Auth.login.noAccount')}{' '}
                  <Anchor
                    c="pink"
                    onClick={() => setIsLogin('register')}
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {t('Auth.login.signUp')}
                  </Anchor>
                </>
              ) : (
                <>
                  {t('Auth.register.hasAccount')}{' '}
                  <Anchor
                    c="pink"
                    onClick={() => setIsLogin('login')}
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {t('Auth.register.signIn')}
                  </Anchor>
                </>
              )}
            </Text>
          </Center>

          {/* Terms */}
          {isLogin === 'register' && (
            <Text size="xs" c="dimmed" ta="center" mt="md">
              {t('Auth.register.terms')}
            </Text>
          )}
        </Paper>

        {/* Footer */}
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          style={{
            position: 'absolute',
            bottom: rem(20),
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          © 2025 TikGrow. All rights reserved.
        </Text>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <LoadingOverlay isVisible={isLoading} />
    </Box>
  );
};

export default LoginPage;