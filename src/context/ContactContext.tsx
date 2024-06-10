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

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Contacts = { contacts: Contact[] };
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];

interface ContactContextProps {
  contacts: Contact[];
  addContact: (contact: Contact) => Promise<Contact | null>;
  updateContact: (contact: Contact) => void;
  deleteContact: (contactId: number) => void;
  findContact: (contact: Contact) => Promise<Contact | null>;
  loading: boolean;
}

const ContactContext = createContext<ContactContextProps>(undefined!);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    const fetchContacts = async () => {
      if (!currentProject) return;

      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("project_id", currentProject.project_id)
        .order("contact_id", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        return;
      }

      setContacts(contacts!);
    };

    fetchContacts();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setContacts((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.contact_id === payload.new.contact_id ? payload.new : contact
          )
        );
      } else if (payload.eventType === "DELETE") {
        setContacts((prev) =>
          prev.filter((contact) => contact.contact_id !== payload.old.contact_id)
        );
      }
    }
    
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
    async (contact: Contact) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .insert([{ ...contact, project_id: currentProject?.project_id }]);
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

  

  const contextValue = useMemo(
    () => ({
      contacts,
      addContact,
      updateContact,
      deleteContact,
      findContact,
      loading,
    }),
    [contacts, addContact, updateContact, deleteContact, findContact, loading]
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
