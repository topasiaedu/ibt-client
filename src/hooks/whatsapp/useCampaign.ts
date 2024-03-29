// /hooks/useCampaign.ts

import { useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFormData } from '../../types/campaignTypes';
import * as campaignService from '../../services/campaignService';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCampaign = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await campaignService.getCampaign(id);
      return data;
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCampaign = async (formData: CampaignFormData) => {
    try {
      const newCampaign = await campaignService.createCampaign(formData);
      setCampaigns(prev => [...prev, newCampaign]);
    } catch (error) {
      console.error('Failed to add campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaign = async (id: number, formData: CampaignFormData) => {
    setIsLoading(true);
    try {
      const updatedCampaign = await campaignService.updateCampaign(id, formData);
      setCampaigns(prev => prev.map(campaign => campaign.id === id ? updatedCampaign : campaign).filter(Boolean) as Campaign[]);
    } catch (error) {
      console.error('Failed to update campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, isLoading, addCampaign, updateCampaign, fetchCampaign };
};
