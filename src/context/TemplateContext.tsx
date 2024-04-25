import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';
import { useWhatsAppBusinessAccountContext } from './WhatsAppBusinessAccountContext';
import { useAlertContext } from './AlertContext';

export type Template = Database['public']['Tables']['templates']['Row'];
export type Templates = { templates: Template[] };
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];

export type Component = {
  type: string;
  format: string | null;
  example: JSON | null;
  text: string | null;
  parameters: string[] | null;
  buttons: TemplateButton[] | null;
}

export type TemplateButton = {
  type: string;
  text: string | null;
  url: string | null;
  phone_number: string | null;
}


interface TemplateContextType {
  templates: Template[];
  addTemplate: (template: TemplateInsert, components: Component[]) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (templateId: number) => void;
  loading: boolean;
}

const TemplateContext = createContext<TemplateContextType>(undefined!);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { selectedWhatsAppBusinessAccount } = useWhatsAppBusinessAccountContext();
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchTemplates = async () => {
      if (!selectedWhatsAppBusinessAccount) return;

      const { data: templates, error } = await supabase
        .from('templates')
        .select('*')
        .eq('account_id', selectedWhatsAppBusinessAccount.account_id)
        .order('template_id', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      setTemplates(templates!);
    };

    fetchTemplates();

    const handleChanges = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setTemplates(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setTemplates(prev => prev.map(template => template.template_id === payload.new.template_id ? payload.new : template));
      } else if (payload.eventType === 'DELETE') {
        setTemplates(prev => prev.filter(template => template.template_id !== payload.old.template_id));
      }
    };

    const subscription = supabase
      .channel('templates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, payload => {
        handleChanges(payload);
      })
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedWhatsAppBusinessAccount]);

  const addTemplate = async (template: TemplateInsert, components: Component[]) =>  {
    const {error} = await supabase
      .from('templates')
      .insert([{ ...template, account_id: selectedWhatsAppBusinessAccount?.account_id }]);
    if (error) {
      console.error('Error adding template:', error);
      showAlert('Error adding template', 'error');
      return null;
    }
  };

  const updateTemplate = async (template: Template) => {
    const { error } = await supabase
      .from('templates')
      .update(template)
      .eq('template_id', template.template_id);
    if (error) {
      console.error('Error updating template:', error);
      showAlert('Error updating template', 'error');
    }
  };

  const deleteTemplate = async (templateId: number) => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('template_id', templateId);
    if (error) {
      console.error('Error deleting template:', error);
      showAlert('Error deleting template', 'error');
    }
  };

  return (
    <TemplateContext.Provider value={{ templates, addTemplate, updateTemplate, deleteTemplate, loading }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
}