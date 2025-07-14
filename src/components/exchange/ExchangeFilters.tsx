// src/components/exchange/ExchangeFilters.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Filters {
  interaction_type?: 'like' | 'comment' | 'follow' | 'view';
  category?: string;
  min_credits?: number;
  max_credits?: number;
}

interface ExchangeFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export default function ExchangeFilters({ 
  filters, 
  onFiltersChange, 
  onClose 
}: ExchangeFiltersProps) {
  const t = useTranslations('Exchange');

  const interactionTypes = [
    { value: 'view', label: t('filters.views'), icon: Eye, credits: 1 },
    { value: 'like', label: t('filters.likes'), icon: Heart, credits: 2 },
    { value: 'comment', label: t('filters.comments'), icon: MessageCircle, credits: 3 },
    { value: 'follow', label: t('filters.follows'), icon: UserPlus, credits: 5 }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'dance', label: 'Dance' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'beauty', label: 'Beauty & Fashion' },
    { value: 'food', label: 'Food & Cooking' },
    { value: 'travel', label: 'Travel' },
    { value: 'pets', label: 'Pets & Animals' },
    { value: 'music', label: 'Music' },
    { value: 'education', label: 'Education' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'tech', label: 'Technology' }
  ];

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Interaction Type Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Interaction Type</Label>
            <div className="space-y-2">
              <Button
                variant={!filters.interaction_type ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('interaction_type', undefined)}
                className="w-full justify-start"
              >
                {t('filters.all')}
              </Button>
              {interactionTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = filters.interaction_type === type.value;
                return (
                  <Button
                    key={type.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('interaction_type', type.value)}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{type.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {type.credits}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Credits Range Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Credits Range</Label>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min credits"
                value={filters.min_credits || ''}
                onChange={(e) => handleFilterChange('min_credits', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                max="10"
              />
              <Input
                type="number"
                placeholder="Max credits"
                value={filters.max_credits || ''}
                onChange={(e) => handleFilterChange('max_credits', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

