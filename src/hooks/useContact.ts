import { useState, useEffect, useCallback } from 'react';
import * as contactService from '../services/contactServices'
import { Contact } from '../types/contactTypes';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContact = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await contactService.getContact(id);
      return data;
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (formData: Contact) => {
    try {
      const newContact = await contactService.createContact(formData);
      setContacts(prev => [...prev, newContact]);
    } catch (error) {
      console.error('Failed to add contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (id: number, formData: Contact) => {
    setIsLoading(true);
    try {
      const updatedContact = await contactService.updateContact(id, formData);
      setContacts(prev => prev.map(contact => contact.id === id ? updatedContact : contact).filter(Boolean) as Contact[]);
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = async (id: number) => {
    setIsLoading(true);
    try {
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, isLoading, addContact, updateContact, deleteContact, fetchContact };
}