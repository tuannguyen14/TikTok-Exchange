
// src/components/campaigns/CampaignStats.tsx
import { CampaignStats as CampaignStatsType } from '@/lib/api/campaigns';

interface CampaignStatsProps {
  stats: CampaignStatsType;
  translations: {
    total: string;
    active: string;
    completed: string;
    paused: string;
    creditsSpent: string;
    actionsReceived: string;
  };
}

export default function CampaignStats({ stats, translations }: CampaignStatsProps) {
  const statCards = [
    {
      value: stats.total,
      label: translations.total,
      color: 'blue',
      icon: 'T'
    },
    {
      value: stats.active,
      label: translations.active,
      color: 'green',
      icon: 'A'
    },
    {
      value: stats.totalCreditsSpent.toLocaleString(),
      label: translations.creditsSpent,
      color: 'purple',
      icon: 'C'
    },
    {
      value: stats.totalActionsReceived.toLocaleString(),
      label: translations.actionsReceived,
      color: 'orange',
      icon: 'R'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <span className="font-semibold text-sm">{stat.icon}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}