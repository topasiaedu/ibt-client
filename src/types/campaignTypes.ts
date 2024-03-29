// /types/campaignTypes.ts

export interface Campaign {
  id: number;
  campaign_id: number;
  project_id: number;
  template_id: number;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface CampaignFormData {
  project_id: number;
  template_id: number;
  name: string;
  description: string;
}
