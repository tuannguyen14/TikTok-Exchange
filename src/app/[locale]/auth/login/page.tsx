// app/login/page.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Mail, Lock, TrendingUp, Heart, MessageCircle, Users, Play } from 'lucide-react';
import LoadingOverlay from '@/components/ui/loading/loading-overlay';

// Memoized components để tránh re-render không cần thiết
const FloatingIcon = React.memo(({ icon: Icon, className, delay }: {
  icon: React.ComponentType<any>;
  className: string;
  delay: number
}) => (
  <div
    className={`absolute opacity-20 animate-pulse ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: '3s'
    }}
  >
    <Icon size={24} />
  </div>
));

const AnimatedBackground = React.memo(() => {
  const floatingIcons = useMemo(() => [
    { icon: Heart, className: "top-20 left-20 text-pink-400", delay: 0 },
    { icon: MessageCircle, className: "top-32 right-32 text-blue-400", delay: 1 },
    { icon: Users, className: "bottom-32 left-32 text-green-400", delay: 2 },
    { icon: Play, className: "bottom-20 right-20 text-purple-400", delay: 3 },
    { icon: TrendingUp, className: "top-1/2 left-10 text-yellow-400", delay: 1.5 },
    { icon: Heart, className: "top-1/3 right-10 text-red-400", delay: 2.5 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {floatingIcons.map((props, index) => (
        <FloatingIcon key={index} {...props} />
      ))}

      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
});

const LoginPage = () => {
  const t = useTranslations();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation logic
  const validateForm = useCallback((data: typeof formData) => {
    const newErrors: Record<string, string> = {};

    if (!data.email) {
      newErrors.email = t('Auth.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = t('Auth.errors.invalidEmail');
    }

    if (!data.password) {
      newErrors.password = t('Auth.errors.passwordRequired');
    } else if (data.password.length < 6) {
      newErrors.password = t('Auth.errors.passwordTooShort');
    }

    return newErrors;
  }, [t]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        console.log("data", data);
        setErrors({ general: data.error || 'An error occurred' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLogin, validateForm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <LoadingOverlay isVisible={isLoading} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            TikGrow
          </h1>
          <p className="text-gray-400 mt-2">
            {t(isLogin ? 'Auth.login.description' : 'Auth.register.description')}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${isLogin
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              {t('Auth.login.title')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${!isLogin
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              {t('Auth.register.title')}
            </button>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder={t('Auth.login.email')}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
              {errors.email && (
                <div className="mt-1 text-red-300 text-sm">{errors.email}</div>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('Auth.login.password')}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <div className="mt-1 text-red-300 text-sm">{errors.password}</div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('Common.loading')}
                </div>
              ) : (
                t(isLogin ? 'Auth.login.submit' : 'Auth.register.submit')
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-pink-400 hover:text-pink-300 text-sm transition-colors duration-200">
                {t('Auth.login.forgotPassword')}
              </a>
            </div>
          )}

          {/* Benefits Section for Registration */}
          {!isLogin && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-white font-medium mb-3">🎉 {t('Auth.register.benefits.0')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  {t('Auth.register.benefits.1')}
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {t('Auth.register.benefits.2')}
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {t('Auth.register.benefits.3')}
                </div>
              </div>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                {t('Auth.login.noAccount')}{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-200"
                >
                  {t('Auth.login.signUp')}
                </button>
              </>
            ) : (
              <>
                {t('Auth.register.hasAccount')}{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-200"
                >
                  {t('Auth.register.signIn')}
                </button>
              </>
            )}
          </div>

          {/* Terms for Registration */}
          {!isLogin && (
            <div className="mt-4 text-center text-xs text-gray-400">
              {t('Auth.register.terms')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2024 TikGrow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;