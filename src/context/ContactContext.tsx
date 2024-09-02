import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import isEqual from "lodash.isequal";
import { useAlertContext } from "./AlertContext";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"] & {
  total_paid: number;
  times_opted_in: number;
}
export type Contacts = { contacts: Contact[] };
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];

interface ContactContextProps {
  contacts: Contact[];
  addContact: (contact: ContactInsert) => Promise<Contact | null>;
  updateContact: (contact: Contact) => void;
  deleteContact: (contactId: number) => void;
  findContact: (contact: Contact) => Promise<Contact | null>;
  findContactByWaId: (wa_id: string) => Promise<Contact | null>;
  searchContacts: (search: string) => void;
  loading: boolean;
  searchResults: Contact[];
}

const ContactContext = createContext<ContactContextProps>(undefined!);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [searchResults, setSearchResults] = useState<Contact[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchContacts = async () => {
      if (!currentProject) return;

      const { data: contacts, error } = await supabase
        .rpc("fetch_contacts_with_stats", {
          p_project_id: currentProject.project_id,
        })

      if (error) {
        console.error("Error fetching contacts:", error);
        return;
      }

      setContacts((prevContacts) => {
        if (isEqual(prevContacts, contacts)) {
          return prevContacts;
        }
        return contacts;
      });
    };

    fetchContacts();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setContacts((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        const contact = contacts.find(
          (contact) => contact.contact_id === payload.new.contact_id
        );

        if (!contact) return;

        setContacts((prev) =>
          prev.map((contact) =>
            contact.contact_id === payload.new.contact_id ? payload.new : contact
          )
        );
      } else if (payload.eventType === "DELETE") {
        const contact = contacts.find(
          (contact) => contact.contact_id === payload.old.contact_id
        );

        if (!contact) return;
        setContacts((prev) =>
          prev.filter(
            (contact) => contact.contact_id !== payload.old.contact_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("contacts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject]);

  const addContact = useCallback(
    async (contact: ContactInsert) => {
      setLoading(true);

      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: contact.name,
            wa_id: contact.wa_id,
            project_id: currentProject?.project_id,
          },
        ])
        .select();
      if (error) {
        console.error("Error adding contact:", error);
        return null;
      }
      setLoading(false);
      return data?.[0] || null;
    },
    [currentProject]
  );

  const updateContact = useCallback(async (contact: Contact) => {
    setLoading(true);
    try {
      await supabase
        .from("contacts")
        .update(contact)
        .eq("contact_id", contact.contact_id)
        .single();
    } catch (error) {
      console.error("Failed to update contact:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (contactId: number) => {
    setLoading(true);
    try {
      await supabase.from("contacts").delete().eq("contact_id", contactId);
    } catch (error) {
      console.error("Failed to delete contact:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const findContact = useCallback(async (contact: Contact) => {
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("wa_id", contact.wa_id);

    if (error) {
      console.error("Error fetching contact:", error);
      return null;
    }

    return contacts?.[0] || null;
  }, []);

  const findContactByWaId = useCallback(async (wa_id: string) => {
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("wa_id", wa_id);

    if (error) {
      console.error("Error fetching contact:", error);
      return null;
    }

    return contacts?.[0] || null;
  }, []);
  
  const searchContacts = useCallback(
    async (searchPattern: string) => {
      if (!currentProject) return;

      // setLoading(true);

      const { data: conversations, error } = await supabase.rpc(
        "search_contacts_with_stats",
        {
          search_pattern: searchPattern,
          page: 1,
          page_size: 1000
        }
      );

      if (error) {
        showAlert("Error searching conversations", "error");
        console.error("Error searching conversations:", error);
        // setLoading(false);
        return;
      }

      if (conversations) {
        // setContacts(conversations);
        setSearchResults(conversations);
      }

      // setLoading(false);
    },
    [currentProject, showAlert]
  );
  const contextValue = useMemo(
    () => ({
      contacts,
      addContact,
      updateContact,
      deleteContact,
      findContact,
      findContactByWaId,
      searchContacts,
      loading,
      searchResults,
    }),
    [contacts, addContact, updateContact, deleteContact, findContact, findContactByWaId, searchContacts, loading, searchResults]
  );

  return (
    <ContactContext.Provider value={contextValue}>
      {children}
    </ContactContext.Provider>
  );
}
// Add the whyDidYouRender property after defining the component
(ContactProvider as any).whyDidYouRender = true; // Add this line
export function useContactContext() {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error("useContactContext must be used within ContactProvider");
  }

  return context;
}
