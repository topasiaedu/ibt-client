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
import { Contact } from "./ContactContext";

export type ContactListMember =
  Database["public"]["Tables"]["contact_list_members"]["Row"] & {
    contact: Contact;
  };

export type ContactList =
  Database["public"]["Tables"]["contact_lists"]["Row"] & {
    contact_list_members: ContactListMember[];
  };
export type ContactLists = { contact_lists: ContactList[] };
export type ContactListInsert =
  Database["public"]["Tables"]["contact_lists"]["Insert"];

interface ContactListContextProps {
  contactLists: ContactList[];
  addContactList: (contactList: ContactList) => void;
  updateContactList: (contactList: ContactList) => void;
  deleteContactList: (contactListId: number) => void;
  removeContactFromContactList: (
    contactListId: number,
    contactId: number
  ) => void;
  addContactToContactList: (contactListId: number, contactId: number) => void;
  loading: boolean;
}

const ContactListContext = createContext<ContactListContextProps>(undefined!);

export function ContactListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    const fetchContactLists = async () => {
      if (!currentProject) return;

      const { data: contactLists, error } = await supabase
        .from("contact_lists")
        .select(
          `*,
          contact_list_members(*,
            contact:contact_id(*)
          )`
        )
        .eq("project_id", currentProject.project_id)
        .order("contact_list_id", { ascending: false });

      if (error) {
        console.error("Error fetching contactLists:", error);
        return;
      }
      setContactLists(contactLists!);
    };

    fetchContactLists();

    const handleChanges = (payload: any) => {
      switch (payload.event) {
        case "INSERT":
          setContactLists([payload.record, ...contactLists]);
          break;
        case "UPDATE":
          setContactLists(
            contactLists.map((c) =>
              c.contact_list_id === payload.record.contact_list_id
                ? payload.record
                : c
            )
          );
          break;
        case "DELETE":
          setContactLists(
            contactLists.filter(
              (c) => c.contact_list_id !== payload.record.contact_list_id
            )
          );
          break;
      }
    };

    const subscription = supabase
      .channel("contact_lists")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_lists" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    const contactListMembersSubscription = supabase
      .channel("contact_list_members")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_list_members" },
        (payload) => {}
      );

    setLoading(false);

    return () => {
      subscription.unsubscribe();
      contactListMembersSubscription.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const addContactList = useCallback(async (contactList: ContactList) => {
    const { error } = await supabase.from("contact_lists").insert(contactList);

    if (error) {
      console.error("Error adding contactList:", error);
      return;
    }
  }, []);

  const updateContactList = useCallback(async (contactList: ContactList) => {
    const { contact_list_members, ...contactListWithoutMembers } = contactList;
    const { error } = await supabase
      .from("contact_lists")
      .update(contactListWithoutMembers)
      .eq("contact_list_id", contactList.contact_list_id);

    if (error) {
      console.error("Error updating contactList:", error);
      return;
    }
  }, []);

  const deleteContactList = useCallback(async (contactListId: number) => {
    const { error } = await supabase
      .from("contact_lists")
      .delete()
      .eq("contact_list_id", contactListId);

    if (error) {
      console.error("Error deleting contactList:", error);
      return null;
    }
  }, []);

  const removeContactFromContactList = useCallback(
    async (contactListId: number, contactId: number) => {
      const { error } = await supabase
        .from("contact_list_members")
        .delete()
        .eq("contact_list_id", contactListId)
        .eq("contact_id", contactId);

      if (error) {
        console.error("Error removing contact from contactList:", error);
        return null;
      }
    },
    []
  );

  const addContactToContactList = useCallback(
    async (contactListId: number, contactId: number) => {
      const { error } = await supabase
        .from("contact_list_members")
        .insert({ contact_list_id: contactListId, contact_id: contactId });

      if (error) {
        console.error("Error adding contact to contactList:", error);
        return null;
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      contactLists,
      addContactList,
      updateContactList,
      deleteContactList,
      removeContactFromContactList,
      addContactToContactList,
      loading,
    }),
    [
      contactLists,
      addContactList,
      updateContactList,
      deleteContactList,
      removeContactFromContactList,
      addContactToContactList,
      loading,
    ]
  );
// Add the whyDidYouRender property after defining the component
(ContactListProvider as any).whyDidYouRender = true; // Add this line
  return (
    <ContactListContext.Provider value={contextValue}>
      {children}
    </ContactListContext.Provider>
  );
}

export function useContactListContext() {
  return useContext(ContactListContext);
}
