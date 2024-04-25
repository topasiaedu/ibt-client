import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';
import { useProjectContext } from './ProjectContext';
import { useAlertContext } from './AlertContext';

export type WhatsAppBusinessAccount = Database['public']['Tables']['whatsapp_business_accounts']['Row'];
export type WhatsAppBusinessAccounts = { whatsapp_business_accounts: WhatsAppBusinessAccount[] };
export type WhatsAppBusinessAccountInsert = Database['public']['Tables']['whatsapp_business_accounts']['Insert'];

interface WhatsAppBusinessAccountContextType {
  whatsAppBusinessAccounts: WhatsAppBusinessAccount[];
  addWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccount) => void;
  updateWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccount) => void;
  deleteWhatsAppBusinessAccount: (whatsAppBusinessAccountId: number) => void;
  selectedWhatsAppBusinessAccount: WhatsAppBusinessAccount | null;
  setSelectedWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccount) => void;
  loading: boolean;
}

const WhatsAppBusinessAccountContext = createContext<WhatsAppBusinessAccountContextType>(undefined!);

export const WhatsAppBusinessAccountProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const storage = window.localStorage.getItem('selectedWhatsAppBusinessAccount');
  const [whatsAppBusinessAccounts, setWhatsAppBusinessAccounts] = useState<WhatsAppBusinessAccount[]>([]);
  const [selectedWhatsAppBusinessAccount, setSelectedWhatsAppBusinessAccount] = useState<WhatsAppBusinessAccount | null>(storage ? JSON.parse(storage) : null);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchWhatsAppBusinessAccounts = async () => {
      if (!currentProject) return;

      const { data: whatsAppBusinessAccounts, error } = await supabase
        .from('whatsapp_business_accounts')
        .select('*')
        .eq('project_id', currentProject.project_id)
        .order('account_id', { ascending: false });

      if (error) {
        console.error('Error fetching WhatsApp Business Accounts:', error);
        showAlert("Error fetching WhatsApp Business Accounts", "error");
        return;
      }

      setWhatsAppBusinessAccounts(whatsAppBusinessAccounts!);

      if (!selectedWhatsAppBusinessAccount && whatsAppBusinessAccounts!.length > 0) {
        setSelectedWhatsAppBusinessAccount(whatsAppBusinessAccounts![0]);
      }
    };

    fetchWhatsAppBusinessAccounts();


    const handleChanges = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setWhatsAppBusinessAccounts(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setWhatsAppBusinessAccounts(prev => prev.map(whatsAppBusinessAccount => whatsAppBusinessAccount.account_id === payload.new.account_id ? payload.new : whatsAppBusinessAccount));
      } else if (payload.eventType === 'DELETE') {
        setWhatsAppBusinessAccounts(prev => prev.filter(whatsAppBusinessAccount => whatsAppBusinessAccount.account_id !== payload.old.account_id));
      }
    };

    const subscription = supabase
      .channel('whatsapp_business_accounts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_business_accounts' }, payload => {
        handleChanges(payload);
      })
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };

  }, [currentProject, selectedWhatsAppBusinessAccount, showAlert]);

  const addWhatsAppBusinessAccount = async (whatsAppBusinessAccount: WhatsAppBusinessAccount) => {
    const { error } = await supabase
      .from('whatsapp_business_accounts')
      .insert(whatsAppBusinessAccount)
      .single();

    if (error) {
      console.error('Error adding WhatsApp Business Account:', error);
      showAlert('Error adding WhatsApp Business Account', 'error');
      return null;
    }
  };

  const updateWhatsAppBusinessAccount = async (whatsAppBusinessAccount: WhatsAppBusinessAccount) => {
    const { error } = await supabase
      .from('whatsapp_business_accounts')
      .update(whatsAppBusinessAccount)
      .eq('account_id', whatsAppBusinessAccount.account_id)
      .single();

    if (error) {
      console.error('Error updating WhatsApp Business Account:', error);
      showAlert('Error updating WhatsApp Business Account', 'error');
      return;
    }
  }

  const deleteWhatsAppBusinessAccount = async (whatsAppBusinessAccountId: number) => {
    const { error } = await supabase
      .from('whatsapp_business_accounts')
      .delete()
      .eq('account_id', whatsAppBusinessAccountId);

    if (error) {
      console.error('Error deleting WhatsApp Business Account:', error);
      showAlert('Error deleting WhatsApp Business Account', 'error');
      return;
    }
  }



  return (
    <WhatsAppBusinessAccountContext.Provider value={{ whatsAppBusinessAccounts, addWhatsAppBusinessAccount, updateWhatsAppBusinessAccount, deleteWhatsAppBusinessAccount, loading, selectedWhatsAppBusinessAccount, setSelectedWhatsAppBusinessAccount }}>
      {children}
    </WhatsAppBusinessAccountContext.Provider>
  );
}

export const useWhatsAppBusinessAccountContext = () => {
  const context = useContext(WhatsAppBusinessAccountContext);
  if (!context) {
    throw new Error('useWhatsAppBusinessAccountContext must be used within an WhatsAppBusinessAccountProvider');
  }
  return context;
};