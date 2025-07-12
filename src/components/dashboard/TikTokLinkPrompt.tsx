// src/components/dashboard/TikTokLinkPrompt.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Users, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TikTokLinkPromptProps {
  onLinkTikTok: () => void;
}

const TikTokLinkPrompt: React.FC<TikTokLinkPromptProps> = ({ onLinkTikTok }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] rounded-full flex items-center justify-center mb-4"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] bg-clip-text text-transparent">
              Link Your TikTok Account
            </CardTitle>
            
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Connect your TikTok username to start creating campaigns and earning credits
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-100 dark:border-red-800">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Boost Engagement</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Get real interactions on your TikTok videos</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Earn Credits</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Interact with others to earn credits</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Grow Community</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Connect with other TikTok creators</p>
              </div>
            </motion.div>

            {/* Credit System Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Zap className="w-4 h-4 text-yellow-600 mr-2" />
                How Credits Work
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    👁️ View +1
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    ❤️ Like +2
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    💬 Comment +3
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    👥 Follow +5
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Button
                onClick={onLinkTikTok}
                size="lg"
                className="bg-gradient-to-r from-[#FE2C55] to-[#FF4081] hover:from-[#FF4081] hover:to-[#FE2C55] text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Link TikTok Account
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                You'll be redirected to your profile page to add your TikTok username
              </p>
            </motion.div>

            {/* Security Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                🔒 We only need your TikTok username for verification. 
                We never ask for your password or access your account.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TikTokLinkPrompt;