'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Eye, Heart, MessageCircle, UserPlus, Coins, ArrowUpDown } from 'lucide-react';

const ActionCard = ({ 
  icon: Icon, 
  action, 
  credits, 
  emoji, 
  index, 
  gradient 
}: {
  icon: any;
  action: string;
  credits: string;
  emoji: string;
  index: number;
  gradient: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200
      }}
      className="group relative"
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Background gradient on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          whileHover={{ opacity: 0.05 }}
        />

        {/* Icon and emoji */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} p-3 shadow-md`}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="w-full h-full text-white" />
          </motion.div>
          
          <motion.div
            className="text-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
          >
            {emoji}
          </motion.div>
        </div>

        {/* Action */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {action}
        </h3>

        {/* Credits */}
        <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {credits}
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 h-1 bg-gradient-to-r ${gradient} rounded-full opacity-60`}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PricingSection = () => {
  const t = useTranslations('LandingPage.pricing');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const earnActions = [
    {
      icon: Eye,
      action: t('earnSection.actions.view.action'),
      credits: t('earnSection.actions.view.credits'),
      emoji: t('earnSection.actions.view.icon'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      action: t('earnSection.actions.like.action'),
      credits: t('earnSection.actions.like.credits'),
      emoji: t('earnSection.actions.like.icon'),
      gradient: 'from-pink-500 to-red-500'
    },
    {
      icon: MessageCircle,
      action: t('earnSection.actions.comment.action'),
      credits: t('earnSection.actions.comment.credits'),
      emoji: t('earnSection.actions.comment.icon'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: UserPlus,
      action: t('earnSection.actions.follow.action'),
      credits: t('earnSection.actions.follow.credits'),
      emoji: t('earnSection.actions.follow.icon'),
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-full text-sm font-medium text-green-600 dark:text-green-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Coins className="w-4 h-4" />
            Transparent Pricing
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Earn Credits Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <ArrowUpDown className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('earnSection.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('earnSection.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnActions.map((action, index) => (
                <ActionCard
                  key={index}
                  icon={action.icon}
                  action={action.action}
                  credits={action.credits}
                  emoji={action.emoji}
                  index={index}
                  gradient={action.gradient}
                />
              ))}
            </div>
          </motion.div>

          {/* Spend Credits Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Coins className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('spendSection.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('spendSection.subtitle')}
              </p>
            </div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5 }}
            >
              <div className="text-center space-y-6">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Coins className="w-12 h-12 text-white" />
                </motion.div>

                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Use Your Earned Credits
                </h4>

                <p className="text-gray-600 dark:text-gray-300">
                  {t('spendSection.note')}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-2xl mb-2">👁️</div>
                    <div className="font-medium text-gray-900 dark:text-white">Views</div>
                    <div className="text-gray-600 dark:text-gray-300">1 credit each</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-2xl mb-2">❤️</div>
                    <div className="font-medium text-gray-900 dark:text-white">Likes</div>
                    <div className="text-gray-600 dark:text-gray-300">2 credits each</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-2xl mb-2">💬</div>
                    <div className="font-medium text-gray-900 dark:text-white">Comments</div>
                    <div className="text-gray-600 dark:text-gray-300">3 credits each</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-medium text-gray-900 dark:text-white">Follows</div>
                    <div className="text-gray-600 dark:text-gray-300">5 credits each</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coins className="w-6 h-6 text-green-500" />
            </motion.div>
            <span className="text-green-700 dark:text-green-300 font-medium">
              100% Free to Use • No Hidden Fees • Fair Exchange System
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;