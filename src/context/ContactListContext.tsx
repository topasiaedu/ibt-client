import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";

export type ContactList = Database['public']['Tables']['contact_lists']['Row'];
export type ContactLists = { contact_lists: ContactList[]; };

interface ContactListContextProps {
  contactLists: ContactList[];
  addContactList: (contactList: ContactList) => void;
  updateContactList: (contactList: ContactList) => void;
  deleteContactList: (contactListId: number) => void;
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
      console.log(contactLists)
      setContactLists(contactLists!);
    };

    fetchContactLists();

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

  }, [currentProject]);

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
    const { data, error } = await supabase
      .from('contact_lists')
      .update(contactList)
      .eq('contact_list_id', contactList.contact_list_id);

    if (error) {
      console.error('Error updating contactList:', error);
      return;
    }

    setContactLists(contactLists.map(c => c.contact_list_id === contactList.contact_list_id ? contactList : c));
  };

  const deleteContactList = async (contactListId: number) => {
    const { data, error } = await supabase
      .from('contact_lists')
      .delete()
      .eq('contact_list_id', contactListId);

    if (error) {
      console.error('Error deleting contactList:', error);
      return null;
    }
  };

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

  return (
    <ContactListContext.Provider value={{ contactLists, addContactList, updateContactList, deleteContactList, loading }}>
      {children}
    </ContactListContext.Provider>
  );

}

export function useContactListContext() {
  return useContext(ContactListContext);
}