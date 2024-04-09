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

  const fetchContactList = async (contact_list_id: number) => {
    setIsLoading(true);
    try {
      const data = await contactListService.getContactList(contact_list_id);
      return data;
    } catch (error) {
      console.error('Failed to fetch contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContactList = async (formData: ContactList) => {
    console.log("This ran with form data: ", formData);
    try {
      const newContactList = await contactListService.createContactList(formData);
      setContactLists(prev => [...prev, newContactList]);
    } catch (error) {
      console.error('Failed to add contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactList = async (contact_list_id: number, formData: ContactList) => {
    setIsLoading(true);
    try {
      const updatedContactList = await contactListService.updateContactList(contact_list_id, formData);
      setContactLists(prev => prev.map(contactList => contactList.contact_list_id === contact_list_id ? updatedContactList : contactList).filter(Boolean) as ContactList[]);
    } catch (error) {
      console.error('Failed to update contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContactList = async (contact_list_id: number) => {
    setIsLoading(true);
    try {
      await contactListService.deleteContactList(contact_list_id);
      setContactLists(prev => prev.filter(contactList => contactList.contact_list_id !== contact_list_id));
    } catch (error) {
      console.error('Failed to delete contact list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContactToContactList = async (contact_list_id: number, contact_id: number) => {
    setIsLoading(true);
    try {
      await contactListService.addContactToContactList(contact_list_id, contact_id);
    } catch (error) {
      console.error('Failed to add contact to list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContactListMembers = async (contact_list_id: number) => {
    setIsLoading(true);
    try {
      const data = await contactListService.fetchContactListMembers(contact_list_id);
      return data;
    } catch (error) {
      console.error('Failed to fetch contact list members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeContactFromContactList = async (contact_list_id: number, contact_id: number) => {
    setIsLoading(true);
    try {
      await contactListService.removeContactFromContactList(contact_list_id, contact_id);
    } catch (error) {
      console.error('Failed to remove contact from list:', error);
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
    deleteContactList,
    addContactToContactList,
    fetchContactListMembers,
    removeContactFromContactList
  };
};