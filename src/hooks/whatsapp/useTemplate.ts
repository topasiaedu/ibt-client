import { useState, useEffect, useCallback } from 'react';
import * as templateService from '../../services/templateService';
import { Template, TemplateFormData } from '../../types/templateTypes';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTemplate = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await templateService.getTemplate(id);
      return data;
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTemplate = async (formData: TemplateFormData) => {
    try {
      const newTemplate = await templateService.createTemplate(formData);
      setTemplates(prev => [...prev, newTemplate]);
    } catch (error) {
      console.error('Failed to add template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: number, formData: TemplateFormData) => {
    setIsLoading(true);
    try {
      const updatedTemplate = await templateService.updateTemplate(id, formData);
      setTemplates(prev => prev.map(template => template.id === id ? updatedTemplate : template).filter(Boolean) as Template[]);
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    setIsLoading(true);
    try {
      await templateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    fetchTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

