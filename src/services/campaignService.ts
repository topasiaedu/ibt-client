// /services/campaignService.ts

import { Campaign, CampaignFormData } from '../types/campaignTypes';
import { supabase } from '../utils/supabaseClient';

export const getCampaigns = async (): Promise<Campaign[]> => {
  let { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*');

  if (error) throw new Error(error.message);
  return campaigns as Campaign[];
};

export const getCampaign = async (id: number): Promise<Campaign> => {
  let { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .match({ id })
    .single(); // Use .single() if you're fetching one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return campaign as Campaign;
}

export const createCampaign = async (formData: CampaignFormData): Promise<Campaign> => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([formData])
    .single(); // Use .single() if you're inserting one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return data;
};

export const updateCampaign = async (id: number, formData: CampaignFormData): Promise<Campaign | null> => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(formData)
    .match({ id });

  if (error) throw new Error(error.message);
  return data as Campaign | null;
};

export const deleteCampaign = async (id: number): Promise<Campaign | null> => {
  const { data, error } = await supabase
    .from('campaigns')
    .delete()
    .match({ id });

  if (error) throw new Error(error.message);
  return data as Campaign | null;
};