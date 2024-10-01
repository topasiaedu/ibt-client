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
import { Contact } from "./ContactContext";
import { PhoneNumber } from "./PhoneNumberContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison
import { Message } from "./MessagesContext";

export type Conversation =
  Database["public"]["Tables"]["conversations"]["Row"] & {
    contact: Contact;
    phone_number: PhoneNumber;
    last_message: Message;
    unread_messages: number;
  };

export type Conversations = { conversations: Conversation[] };
export type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate =
  Database["public"]["Tables"]["conversations"]["Update"];

interface ConversationContextType {
  conversations: Conversation[];
  fetchConversationById: (conversationId: string) => Promise<Conversation | undefined>;
  createConversation: (conversation: ConversationInsert) => Promise<void>;
  updateConversation: (conversation: ConversationUpdate) => Promise<void>;
  deleteConversation: (conversation: Conversation) => Promise<void>;
  loading: boolean;
  searchConversations: (searchPattern: string) => Promise<void>;
  searchResults: any[];
  updateLastMessageStatus: (messageId: number, status: string) => Promise<void>;
  readMessages: (conversationId: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType>(undefined!);

export const ConversationProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchConversations = async (page = 1, pageSize = 10) => {
      if (!currentProject) return;

      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `*,
          contact:contact_id (*),
          phone_number:phone_number_id (*),
          last_message:last_message_id (*)`
        )
        .eq("project_id", currentProject.project_id)
        .order("last_message_id", { ascending: false })
        // last_message not null
        .not("last_message_id", 'is', null)
        .range(start, end); // Fetch only the specified range of conversations

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      // Fetch Unread count for each conversation
      for (const conversation of conversations) {
        const { data: unreadCount, error: unreadCountError } = await supabase
          .from("messages")
          .select("message_id")
          .eq("conversation_id", conversation.id)
          .eq("direction", "inbound")
          .neq("status", "READ");

        if (unreadCountError) {
          console.error("Error fetching unread count:", unreadCountError);
          return;
        }

        conversation.unread_messages = unreadCount?.length || 0;
      }

      setConversations((prevConversations) => {
        if (isEqual(prevConversations, conversations)) {
          return prevConversations;
        }
        return conversations;
      });
    };

    // Example usage:
    fetchConversations(1, 100); // Fetch the first page with 10 conversations per page

    const handleChanges = async (payload: any) => {
      console.log("Conversation changes:", payload.eventType);
      if (payload.eventType === "INSERT") {
        // Check if its under the same project
        if (payload.new.project_id !== currentProject?.project_id) {
          return;
        }
        setConversations((prevConversations) => {
          const newConversations = [payload.new, ...prevConversations];
          if (isEqual(prevConversations, newConversations)) {
            return prevConversations;
          }
          return newConversations;
        });
      } else if (payload.eventType === "UPDATE") {
        // Check if its under the same project
        if (payload.new.project_id !== currentProject?.project_id) {
          return;
        }
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

        const { data: lastMessage, error: lastMessageError } = await supabase
          .from("messages")
          .select("*")
          .eq("message_id", payload.new.last_message_id)
          .single();

        if (lastMessageError) {
          console.error("Error fetching last message:", lastMessageError);
          return;
        }

        // Unread Messages
        const { data: unreadCount, error: unreadCountError } = await supabase
          .from("messages")
          .select("message_id")
          .eq("conversation_id", payload.new.id)
          .eq("direction", "inbound")
          .neq("status", "READ");

        if (unreadCountError) {
          console.error("Error fetching unread count:", unreadCountError);
          return;
        }

        payload.new.unread_messages = unreadCount?.length || 0;

        setConversations((prevConversations) => {
          // Remove the conversation with the matching id from the list
          const filteredConversations = prevConversations.filter(
            (conversation) => conversation.id !== payload.new.id
          );

          // Create the updated conversation object
          const newConversation = {
            ...payload.new,
            contact,
            phone_number: phoneNumber,
            last_message: lastMessage,
          };

          // Add the updated conversation at the beginning of the list
          const updatedConversations = [
            newConversation,
            ...filteredConversations,
          ];

          // Check if the updatedConversations is different from the previous list
          if (isEqual(prevConversations, updatedConversations)) {
            return prevConversations;
          }

          return updatedConversations;
        });
      } else if (payload.eventType === "DELETE") {
        setConversations((prevConversations) => {
          const filteredConversations = prevConversations.filter(
            (conversation) => conversation.id !== payload.old.id
          );

          if (isEqual(prevConversations, filteredConversations)) {
            return prevConversations;
          }
          return filteredConversations;
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

  const fetchConversationById = useCallback(async (conversationId: string) => {
    // Try looking in the existing conversations
    const existingConversation = conversations.find(
      (conversation) => conversation.id === conversationId
    );

    if (existingConversation) {
      return existingConversation;
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(
        `*,
          contact:contact_id (*),
          phone_number:phone_number_id (*),
          last_message:last_message_id (*)`
      )
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error("Error fetching conversation:", error);
      return;
    }

    return conversation;
  }, [conversations]);

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

  const searchConversations = useCallback(
    async (searchPattern: string) => {
      if (!currentProject) return;

      // setLoading(true);

      const { data: conversations, error } = await supabase.rpc(
        "search_conversations_and_messages",
        {
          search_pattern: searchPattern,
          p_project_id: currentProject.project_id, 
        }
      );

      if (error) {
        showAlert("Error searching conversations", "error");
        console.error("Error searching conversations:", error);
        // setLoading(false);
        return;
      }

      if (conversations) {
        // setConversations(conversations);
        setSearchResults(conversations);
      }

      // setLoading(false);
    },
    [currentProject, showAlert]
  );

  const updateLastMessageStatus = useCallback(
    async (messageId: number, status: string) => {
      // Find conversation, update last message, then update the state
      const conversation = conversations.find(
        (conversation) => conversation.last_message_id === messageId
      );

      if (!conversation) {
        console.error("Conversation not found");
        return;
      }

      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) => {
          if (conv.id === conversation.id) {
            return {
              ...conv,
              last_message: {
                ...conv.last_message,
                status,
              },
            };
          }
          return conv;
        });

        return updatedConversations;
      });
    },
    [conversations]
  );

  const readMessages = useCallback(
    async (conversationId: string) => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("direction", "inbound");

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const unreadMessages = messages.filter(
        (message: Message) => message.status !== "READ"
      );

      for (const message of unreadMessages) {
        await supabase
          .from("messages")
          .update({ status: "READ" })
          .eq("message_id", message.message_id);
      }
    },
    []
  );

  const value = useMemo(() => {
    return {
      conversations,
      fetchConversationById,
      createConversation,
      updateConversation,
      deleteConversation,
      loading,
      searchConversations,
      searchResults,
      updateLastMessageStatus,
      readMessages,

    };
  }, [
    conversations,
    fetchConversationById,
    createConversation,
    updateConversation,
    deleteConversation,
    loading,
    searchConversations,
    searchResults,
    updateLastMessageStatus,
    readMessages,
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
