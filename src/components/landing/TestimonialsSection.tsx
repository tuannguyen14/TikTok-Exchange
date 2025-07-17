'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';

const TestimonialCard = ({ 
  name, 
  username, 
  content, 
  rating, 
  index 
}: {
  name: string;
  username: string;
  content: string;
  rating: number;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
      className="group"
    >
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden h-full"
      >
        {/* Quote icon */}
        <motion.div
          className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity"
          whileHover={{ rotate: 15, scale: 1.2 }}
        >
          <Quote className="w-12 h-12 text-pink-500" />
        </motion.div>

        {/* Avatar */}
        <div className="flex items-center mb-6">
          <motion.div
            className="w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {name.charAt(0)}
          </motion.div>
          <div className="ml-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
            <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">{username}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.2 + i * 0.1 + 0.5,
                type: "spring",
                stiffness: 500
              }}
            >
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
          className="text-gray-600 dark:text-gray-300 leading-relaxed italic"
        >
          "{content}"
        </motion.p>

        {/* Decorative elements */}
        <div className="absolute bottom-4 left-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
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

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          whileHover={{ opacity: 1 }}
        />
      </motion.div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const t = useTranslations('LandingPage.testimonials');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: t('items.testimonial1.name'),
      username: t('items.testimonial1.username'),
      content: t('items.testimonial1.content'),
      rating: 5 // Fixed rating as number
    },
    {
      name: t('items.testimonial2.name'),
      username: t('items.testimonial2.username'),
      content: t('items.testimonial2.content'),
      rating: 5 // Fixed rating as number
    },
    {
      name: t('items.testimonial3.name'),
      username: t('items.testimonial3.username'),
      content: t('items.testimonial3.content'),
      rating: 5 // Fixed rating as number
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-blue-50/50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-blue-900/10" />
        
        {/* Floating testimonial bubbles */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-full text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 fill-current" />
            Testimonials
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-yellow-600 to-orange-600 dark:from-white dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              username={testimonial.username}
              content={testimonial.content}
              rating={testimonial.rating}
              index={index}
            />
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  4.9/5
                </motion.div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Average Rating</p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  10,000+
                </motion.div>
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Happy Creators</p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  98%
                </motion.div>
                <div className="flex justify-center mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-5 h-5 text-blue-500" />
                  </motion.div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Success Rate</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Trusted by creators worldwide</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Safe & secure platform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Real organic growth</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;