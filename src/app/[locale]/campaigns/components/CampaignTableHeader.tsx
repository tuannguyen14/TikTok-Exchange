// src/components/campaigns/CampaignTableHeader.tsx
interface CampaignTableHeaderProps {
    translations: {
      type: string;
      target: string;
      interaction: string;
      progress: string;
      creditsPerAction: string;
      status: string;
      created: string;
      actions: string;
    };
  }
  
  export default function CampaignTableHeader({ translations }: CampaignTableHeaderProps) {
    return (
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.type}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.target}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.interaction}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.progress}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.creditsPerAction}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.status}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.created}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {translations.actions}
          </th>
        </tr>
      </thead>
    );
  }