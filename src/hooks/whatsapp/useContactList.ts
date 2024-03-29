import { useState, useEffect, useCallback } from 'react';
import * as contactListService from '../../services/contactListService';
import { ContactList } from '../../types/contactListTypes';

export const useContactLists = () => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchContactLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await contactListService.getContactLists();
      setContactLists(data);
    } catch (error) {
      console.error('Failed to fetch contact lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContactList = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await contactListService.getContactList(id);
      return data;
    } catch (error) {
      console.error('Failed to fetch contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContactList = async (formData: ContactList) => {
    try {
      const newContactList = await contactListService.createContactList(formData);
      setContactLists(prev => [...prev, newContactList]);
    } catch (error) {
      console.error('Failed to add contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactList = async (id: number, formData: ContactList) => {
    setIsLoading(true);
    try {
      const updatedContactList = await contactListService.updateContactList(id, formData);
      setContactLists(prev => prev.map(contactList => contactList.id === id ? updatedContactList : contactList).filter(Boolean) as ContactList[]);
    } catch (error) {
      console.error('Failed to update contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContactList = async (id: number) => {
    setIsLoading(true);
    try {
      await contactListService.deleteContactList(id);
      setContactLists(prev => prev.filter(contactList => contactList.id !== id));
    } catch (error) {
      console.error('Failed to delete contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactLists();
  }, [fetchContactLists]);

  return {
    contactLists,
    isLoading,
    fetchContactList,
    addContactList,
    updateContactList,
    deleteContactList
  };
};