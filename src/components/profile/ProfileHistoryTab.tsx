// src/components/profile/ProfileHistoryTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Activity, 
  TrendingUp, 
  Coins 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types/profile';

interface ProfileHistoryTabProps {
  formatDate: (date: string) => string;
}

const ProfileHistoryTab: React.FC<ProfileHistoryTabProps> = ({
  formatDate
}) => {
  const t = useTranslations('Profile');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock transactions data - replace with actual API call
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'earn',
        amount: 5,
        description: 'Earned from follow action',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        balance_after: 105
      },
      {
        id: '2',
        type: 'spend',
        amount: -10,
        description: 'Campaign creation: like for video',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        balance_after: 100
      },
      {
        id: '3',
        type: 'earn',
        amount: 3,
        description: 'Earned from comment action',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        balance_after: 110
      },
      {
        id: '4',
        type: 'bonus',
        amount: 50,
        description: 'Welcome bonus',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        balance_after: 107
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'spend':
        return <Coins className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'bonus':
        return <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'spend':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'bonus':
        return 'bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'bonus':
        return 'text-green-600 dark:text-green-400';
      case 'spend':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('history.transactionHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('history.transactionHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getAmountColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('history.balance')}: {transaction.balance_after}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{t('history.noTransactions')}</p>
              <p className="text-sm">{t('history.startInteracting')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHistoryTab;