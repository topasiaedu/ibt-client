import { useState, useEffect, useCallback } from 'react';
import * as whatsappBusinessAccountService from '../../services/whatsappBusinessAccountsService';
import { WhatsAppBusinessAccount, WhatsAppBusinessAccountFormData } from '../../types/whatsappBusinessAccountsTypes';

export const useWhatsappBusinessAccounts = () => {
  const [whatsappBusinessAccounts, setWhatsappBusinessAccounts] = useState<WhatsAppBusinessAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWhatsappBusinessAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await whatsappBusinessAccountService.getWhatsAppBusinessAccounts();
      setWhatsappBusinessAccounts(data);
    } catch (error) {
      console.error('Failed to fetch whatsapp business accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWhatsappBusinessAccount = async (account_id: number) => {
    setIsLoading(true);
    try {
      const data = await whatsappBusinessAccountService.getWhatsAppBusinessAccount(account_id);
      return data;
    } catch (error) {
      console.error('Failed to fetch whatsapp business account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addWhatsappBusinessAccount = async (formData: WhatsAppBusinessAccountFormData) => {
    try {
      const newWhatsappBusinessAccount = await whatsappBusinessAccountService.createWhatsAppBusinessAccount(formData);
      setWhatsappBusinessAccounts(prev => [...prev, newWhatsappBusinessAccount]);
    } catch (error) {
      console.error('Failed to add whatsapp business account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWhatsappBusinessAccount = async (account_id: number, formData: WhatsAppBusinessAccountFormData) => {
    setIsLoading(true);
    try {
      const updatedWhatsappBusinessAccount = await whatsappBusinessAccountService.updateWhatsAppBusinessAccount(account_id, formData);
      setWhatsappBusinessAccounts(prev => prev.map(whatsappBusinessAccount => whatsappBusinessAccount.account_id === account_id ? updatedWhatsappBusinessAccount : whatsappBusinessAccount).filter(Boolean) as WhatsAppBusinessAccount[]);
    } catch (error) {
      console.error('Failed to update whatsapp business account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWhatsappBusinessAccount = async (account_id: number) => {
    setIsLoading(true);
    try {
      await whatsappBusinessAccountService.deleteWhatsAppBusinessAccount(account_id);
      setWhatsappBusinessAccounts(prev => prev.filter(whatsappBusinessAccount => whatsappBusinessAccount.account_id !== account_id));
    } catch (error) {
      console.error('Failed to delete whatsapp business account:', error);
    }
  }

  useEffect(() => {
    fetchWhatsappBusinessAccounts();
  }, [fetchWhatsappBusinessAccounts]);

  return {
    whatsappBusinessAccounts,
    isLoading,
    fetchWhatsappBusinessAccounts,
    fetchWhatsappBusinessAccount,
    addWhatsappBusinessAccount,
    updateWhatsappBusinessAccount,
    deleteWhatsappBusinessAccount,
  };

}