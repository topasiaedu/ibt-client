// /types/campaignTypes.ts

export interface Campaign {
  campaign_id: number
  contact_list_id: number
  created_at: string | null
  name: string
  post_time: string
  template_id: number | null
  updated_at: string | null
}

export interface CampaignFormData {
  name: string
  template_id: number
  contact_list_id: number
  post_time: string
}
