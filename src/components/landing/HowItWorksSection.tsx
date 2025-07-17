'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, Coins, Rocket, ArrowRight, CheckCircle } from 'lucide-react';

const StepCard = ({
  step,
  icon: Icon,
  title,
  description,
  index,
  isLast = false
}: {
  step: string;
  icon: any;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Step number and icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{
          duration: 0.6,
          delay: index * 0.2,
          type: "spring",
          stiffness: 200
        }}
        className="relative z-10 mb-8"
      >
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>

        {/* Step number badge */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-pink-500"
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
        >
          {step}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
        className="text-center max-w-sm"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Connecting arrow */}
      {!isLast && (
        <motion.div
          className="hidden lg:block absolute top-12 left-full transform -translate-y-1/2 w-32 z-0"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-8 h-8 text-pink-400 mx-auto" />
          </motion.div>
          <div className="w-full h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 mt-2 rounded-full" />
        </motion.div>
      )}
    </div>
  );
};

const HowItWorksSection = () => {
  const t = useTranslations('LandingPage.howItWorks');
  const t2 = useTranslations('LandingPage.howItWorksSection');
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    {
      step: '1',
      icon: UserPlus,
      title: t('steps.step1.title'),
      description: t('steps.step1.description')
    },
    {
      step: '2',
      icon: Coins,
      title: t('steps.step2.title'),
      description: t('steps.step2.description')
    },
    {
      step: '3',
      icon: Rocket,
      title: t('steps.step3.title'),
      description: t('steps.step3.description')
    }
  ];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-blue-50/30 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-blue-900/10" />

        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-500/20 rounded-full text-sm font-medium text-pink-600 dark:text-pink-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <CheckCircle className="w-4 h-4" />
            Simple Process
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 dark:from-white dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 relative">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step.step}
              icon={step.icon}
              title={step.title}
              description={step.description}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t2('title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t2('subtitle')}
            </p>

            <motion.button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t2('cta')}
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>

            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t2('features.freeToStart')}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t2('features.noCreditCard')}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t2('features.freeCredits')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;