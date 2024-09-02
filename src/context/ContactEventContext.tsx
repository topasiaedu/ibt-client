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

export type ContactEvent =
  Database["public"]["Tables"]["contact_events"]["Row"];
export type ContactEvents = { contactEvents: ContactEvent[] };
export type ContactEventInsert =
  Database["public"]["Tables"]["contact_events"]["Insert"];
export type ContactEventUpdate =
  Database["public"]["Tables"]["contact_events"]["Update"];

interface ContactEventContextProps {
  contactEvents: ContactEvent[];
  addContactEvent: (
    contactEvent: ContactEventInsert
  ) => Promise<ContactEvent | null>;
  updateContactEvent: (contactEvent: ContactEventUpdate) => void;
  deleteContactEvent: (contactEventId: number) => void;
  findContactEvent: (
    contactEvent: ContactEvent
  ) => Promise<ContactEvent | null>;
  loading: boolean;
  bulkAddContactEvents: (
    contactEvents: ContactEventInsert[]
  ) => Promise<ContactEvent[]>;
  fetchContactEventsByContactId: (contactId: number) => Promise<ContactEvent[]>;
}

const ContactEventContext = createContext<ContactEventContextProps>(undefined!);

export function ContactEventProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contactEvents, setContactEvents] = useState<ContactEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    const fetchContactEvents = async () => {
      if (!currentProject) return;

      const { data: contactEvents, error } = await supabase
        .from("contact_events")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching contact events:", error);
        return;
      }

      setContactEvents((prevContactEvents) => {
        if (isEqual(prevContactEvents, contactEvents)) {
          return prevContactEvents;
        }
        return contactEvents;
      });
    };

    fetchContactEvents();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setContactEvents((prevContactEvents) => {
          return [payload.new, ...prevContactEvents];
        });
      }

      if (payload.eventType === "UPDATE") {
        setContactEvents((prevContactEvents) => {
          return prevContactEvents.map((contactEvent) => {
            if (contactEvent.id === payload.new.id) {
              return payload.new;
            }
            return contactEvent;
          });
        });
      }

      if (payload.eventType === "DELETE") {
        setContactEvents((prevContactEvents) => {
          return prevContactEvents.filter(
            (contactEvent) => contactEvent.id !== payload.old.id
          );
        });
      }
    };

    const subscription = supabase
      .channel("contact_events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_events" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject]);

  const addContactEvent = useCallback(
    async (contactEvent: ContactEventInsert) => {
      const { data, error } = await supabase
        .from("contact_events")
        .insert(contactEvent);

      if (error) {
        console.error("Error adding contact event:", error);
        return null;
      }

      return data?.[0] || null;
    },
    []
  );

  const updateContactEvent = useCallback(
    async (contactEvent: ContactEventUpdate) => {
      const { error } = await supabase
        .from("contact_events")
        .update(contactEvent)
        .eq("id", contactEvent.id);

      if (error) {
        console.error("Error updating contact event:", error);
      }
    },

    []
  );

  const deleteContactEvent = useCallback(async (contactEventId: number) => {
    const { error } = await supabase
      .from("contact_events")
      .delete()
      .eq("id", contactEventId);

    if (error) {
      console.error("Error deleting contact event:", error);
    }
  }, []);

  const findContactEvent = useCallback(
    async (contactEvent: ContactEvent) => {
      const { data, error } = await supabase
        .from("contact_events")
        .select("*")
        .eq("id", contactEvent.id);

      if (error) {
        console.error("Error finding contact event:", error);
        return null;
      }

      return data?.[0] || null;
    },

    []
  );

  const bulkAddContactEvents = useCallback(
    async (contactEvents: ContactEventInsert[]) => {
      const { data, error } = await supabase
        .from("contact_events")
        .insert(contactEvents);

      if (error) {
        console.error("Error bulk adding contact events:", error);
        return [];
      }

      return data || [];
    },

    []
  );

  const fetchContactEventsByContactId = useCallback(
    async (contactId: number) => {
      const { data, error } = await supabase
        .from("contact_events")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact events by contact id:", error);
        return [];
      }

      return data || [];
    },

    []
  );

  const value = useMemo(
    () => ({
      contactEvents,
      addContactEvent,
      updateContactEvent,
      deleteContactEvent,
      findContactEvent,
      loading,
      bulkAddContactEvents,
      fetchContactEventsByContactId,
    }),
    [
      contactEvents,
      addContactEvent,
      updateContactEvent,
      deleteContactEvent,
      findContactEvent,
      loading,
      bulkAddContactEvents,
      fetchContactEventsByContactId,
    ]
  );

  return (
    <ContactEventContext.Provider value={value}>
      {children}
    </ContactEventContext.Provider>
  );
}

export function useContactEventContext() {
  const context = useContext(ContactEventContext);
  if (!context) {
    throw new Error(
      "useContactEventContext must be used within a ContactEventProvider"
    );
  }
  return context;
}
// Add the whyDidYouRender property after defining the component
(ContactEventProvider as any).whyDidYouRender = true;
