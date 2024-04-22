import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import { Contact } from "./ContactContext";

// Define a type for contact list members that includes the contact details
export type ContactListMember = Database['public']['Tables']['contact_list_members']['Row'] & {
  contact: Contact;
};

// Modify the ContactList type to include an array of ContactListMember
export type ContactList = Database['public']['Tables']['contact_lists']['Row'] & {
  contact_list_members: ContactListMember[];
};

export type ContactLists = { contact_lists: ContactList[]; };

interface ContactListContextProps {
  contactLists: ContactList[];
  addContactList: (contactList: ContactList) => void;
  updateContactList: (contactList: ContactList) => void;
  deleteContactList: (contactListId: number) => void;
  removeContactFromContactList: (contactListId: number, contactId: number) => void;
  addContactToContactList: (contactListId: number, contactId: number) => void;
  loading: boolean;
}

const ContactListContext = createContext<ContactListContextProps>(undefined!);

export function ContactListProvider({ children }: { children: React.ReactNode }) {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState<boolean>(false)
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true)
    const fetchContactLists = async () => {
      if (!currentProject) return;

      const { data: contactLists, error } = await supabase
        .from('contact_lists')
        .select(`*,
          contact_list_members(*,
            contact:contact_id(*)
          )`)
        .eq('project_id', currentProject.project_id)
        .order('contact_list_id', { ascending: false });

      if (error) {
        console.error('Error fetching contactLists:', error);
        return;
      }
      setContactLists(contactLists!);
    };

    fetchContactLists();

    const handleChanges = (payload: any) => {
      switch (payload.event) {
        case 'INSERT':
          setContactLists([payload.record, ...contactLists]);
          break;
        case 'UPDATE':
          setContactLists(contactLists.map(c => c.contact_list_id === payload.record.contact_list_id ? payload.record : c));
          break;
        case 'DELETE':
          setContactLists(contactLists.filter(c => c.contact_list_id !== payload.record.contact_list_id));
          break;
      }
    };

    const subscription = supabase
      .channel('contact_lists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_lists' }, payload => {
        handleChanges(payload);
      })
      .subscribe()

    setLoading(false)

    return () => {
      subscription.unsubscribe();
    };

  }, [contactLists, currentProject]);

  const addContactList = async (contactList: ContactList) => {
    const { data, error } = await supabase
      .from('contact_lists')
      .insert(contactList);

    if (error) {
      console.error('Error adding contactList:', error);
      return;
    }

    setContactLists([...contactLists, data![0]]);
  };

  const updateContactList = async (contactList: ContactList) => {
    const { contact_list_members, ...contactListWithoutMembers } = contactList;    
    const { error } = await supabase
      .from('contact_lists')
      .update(contactListWithoutMembers)
      .eq('contact_list_id', contactList.contact_list_id);

    if (error) {
      console.error('Error updating contactList:', error);
      return;
    }
  };

  const deleteContactList = async (contactListId: number) => {
    const { error } = await supabase
      .from('contact_lists')
      .delete()
      .eq('contact_list_id', contactListId);

    if (error) {
      console.error('Error deleting contactList:', error);
      return null;
    }
  };

  const removeContactFromContactList = async (contactListId: number, contactId: number) => {
    const { error } = await supabase
      .from('contact_list_members')
      .delete()
      .eq('contact_list_id', contactListId)
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error removing contact from contactList:', error);
      return null;
    }
  };

  const addContactToContactList = async (contactListId: number, contactId: number) => {
    const { error } = await supabase
      .from('contact_list_members')
      .insert({ contact_list_id: contactListId, contact_id: contactId });

    if (error) {
      console.error('Error adding contact to contactList:', error);
      return null;
    }
  };



  return (
    <ContactListContext.Provider value={{ contactLists, addContactList, updateContactList, deleteContactList, removeContactFromContactList, addContactToContactList, loading }}>
      {children}
    </ContactListContext.Provider>
  );

}

export function useContactListContext() {
  return useContext(ContactListContext);
}