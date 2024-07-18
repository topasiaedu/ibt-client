import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import { useAlertContext } from "./AlertContext";
import { Contact, useContactContext } from "./ContactContext";
import { PhoneNumber, usePhoneNumberContext } from "./PhoneNumberContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison
import { Message } from "./MessagesContext";

export type Conversation =
  Database["public"]["Tables"]["conversations"]["Row"] & {
    contact: Contact;
    phone_number: PhoneNumber;
    last_message: Message;
  };

export type Conversations = { conversations: Conversation[] };
export type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

interface ConversationContextType {
  conversations: Conversation[];
  createConversation: (conversation: ConversationInsert) => Promise<void>;
  updateConversation: (conversation: ConversationUpdate) => Promise<void>;
  deleteConversation: (conversation: Conversation) => Promise<void>;
  loading: boolean;
}

const ConversationContext = createContext<ConversationContextType>(undefined!);

export const ConversationProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchConversations = async () => {
      if (!currentProject) return;

      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `*,
          contact:contact_id (*),
          phone_number:phone_number_id (*),
          last_message:last_message_id (*)`
        )
        .eq("project_id", currentProject.project_id)
        .order("last_message_id", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      setConversations((prevConversations) => {
        if (isEqual(prevConversations, conversations)) {
          return prevConversations;
        }
        return conversations;
      });
    };

    fetchConversations();

    const handleChanges = async (payload: any) => {
      if (payload.eventType === "INSERT") {
        setConversations((prevConversations) => {
          return [payload.new, ...prevConversations];
        });
      } else if (payload.eventType === "UPDATE") {
        // Fetch contact, phone number, and last message
        const { data: contact, error: contactError } = await supabase
          .from("contacts")
          .select("*")
          .eq("contact_id", payload.new.contact_id)
          .single();

        if (contactError) {
          console.error("Error fetching contact:", contactError);
          return;
        }

        const { data: phoneNumber, error: phoneNumberError } = await supabase
          .from("phone_numbers")
          .select("*")
          .eq("phone_number_id", payload.new.phone_number_id)
          .single();

        if (phoneNumberError) {
          console.error("Error fetching phone number:", phoneNumberError);
          return;
        }

        const { data: lastMessage, error } = await supabase
          .from("messages")
          .select("*")
          .eq("message_id", payload.new.last_message_id)
          .single();

        if (error) {
          console.error("Error fetching last message:", error);
          return;
        }

        setConversations((prevConversations) => {
          return prevConversations.map((conversation) => {
            if (conversation.id === payload.new.id) {
              return {
                ...payload.new,
                contact,
                phone_number: phoneNumber,
                last_message: lastMessage,
              };
            }
            return conversation;
          });
        });
      } else if (payload.eventType === "DELETE") {
        setConversations((prevConversations) => {
          return prevConversations.filter(
            (conversation) => conversation.id !== payload.old.id
          );
        });
      }
    };

    const subscription = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
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

  const createConversation = useCallback(
    async (conversation: ConversationInsert) => {
      const { error } = await supabase
        .from("conversations")
        .insert([conversation]);

      if (error) {
        showAlert("Error creating conversation", "error");
        console.error("Error creating conversation:", error);
        return;
      }

      showAlert("Conversation created successfully", "success");
    },
    [showAlert]
  );

  const updateConversation = useCallback(
    async (conversation: ConversationUpdate) => {
      const { error } = await supabase
        .from("conversations")
        .update(conversation)
        .eq("id", conversation.id);

      if (error) {
        showAlert("Error updating conversation", "error");
        console.error("Error updating conversation:", error);
        return;
      }
    },
    [showAlert]
  );

  const deleteConversation = useCallback(
    async (conversation: Conversation) => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("conversation_id", conversation.id);

      if (error) {
        showAlert("Error deleting conversation", "error");
        console.error("Error deleting conversation:", error);
        return;
      }

      showAlert("Conversation deleted successfully", "success");
    },
    [showAlert]
  );

  const value = useMemo(() => {
    return {
      conversations,
      createConversation,
      updateConversation,
      deleteConversation,
      loading,
    };
  }, [
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    loading,
  ]);

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

// Add the WhyDidYouRender DevTool to the ConversationProvider component
(ConversationProvider as any).whyDidYouRender = true;

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversationContext must be used within a ConversationProvider"
    );
  }
  return context;
};
