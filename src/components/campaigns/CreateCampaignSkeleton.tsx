// src/components/campaigns/CreateCampaignSkeleton.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateCampaignSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video URL */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>

                {/* Video Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-3 w-40" />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Interaction Types */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Count */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 flex-1" />
                    <div className="flex space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-12" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Credits Summary */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>

            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-16" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}