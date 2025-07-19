// src/app/[locale]/campaigns/types.ts
export interface ServerTranslations {
    title: string;
    description: string;
    stats: {
      total: string;
      active: string;
      completed: string;
      paused: string;
      creditsSpent: string;
      actionsReceived: string;
    };
    tabs: {
      all: string;
      video: string;
      follow: string;
    };
    table: {
      type: string;
      target: string;
      interaction: string;
      progress: string;
      creditsPerAction: string;
      status: string;
      created: string;
      actions: string;
    };
    status: {
      active: string;
      paused: string;
      completed: string;
      expired: string;
    };
    actions: {
      pause: string;
      resume: string;
      edit: string;
      delete: string;
      view: string;
    };
    buttons: {
      createCampaign: string;
      filter: string;
      refresh: string;
    };
    empty: {
      title: string;
      description: string;
      action: string;
    };
    deleteConfirm: {
      title: string;
      description: string;
      confirm: string;
      cancel: string;
    };
  }
  
  export interface CampaignStatsData {
    total: number;
    active: number;
    completed: number;
    paused: number;
    totalCreditsSpent: number;
    totalActionsReceived: number;
  }
  
  export type CampaignType = 'all' | 'video' | 'follow';
  export type CampaignStatus = 'active' | 'paused' | 'completed' | 'expired';