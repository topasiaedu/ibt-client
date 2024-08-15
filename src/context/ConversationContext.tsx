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
  };

export type Conversations = { conversations: Conversation[] };
export type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate =
  Database["public"]["Tables"]["conversations"]["Update"];

interface ConversationContextType {
  conversations: Conversation[];
  createConversation: (conversation: ConversationInsert) => Promise<void>;
  updateConversation: (conversation: ConversationUpdate) => Promise<void>;
  deleteConversation: (conversation: Conversation) => Promise<void>;
  loading: boolean;
  searchConversations: (searchPattern: string) => Promise<void>;
  searchResults: any[];
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
        .range(start, end);  // Fetch only the specified range of conversations
    
      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }
    
      setConversations((prevConversations) => {
        if (isEqual(prevConversations, conversations)) {
          return[conversations, ...prevConversations];
        }
        return conversations;
      });
    };
    
    // Example usage:
    fetchConversations(1, 1000); // Fetch the first page with 10 conversations per page
    fetchConversations(2, 2000); // Fetch the first page with 10 conversations per page

    const handleChanges = async (payload: any) => {
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
  
      const { data: conversations, error } = await supabase
        .rpc("search_conversations_and_messages", {
          search_pattern: searchPattern,
        });
  
      if (error) {
        showAlert("Error searching conversations", "error");
        console.error("Error searching conversations:", error);
        // setLoading(false);
        return;
      }
  
      if (conversations) {
        // setConversations(conversations);
        console.log("Search results:", conversations);
        setSearchResults(conversations);
      }
  
      // setLoading(false);
    },
    [currentProject, showAlert]
  );

  const value = useMemo(() => {
    return {
      conversations,
      createConversation,
      updateConversation,
      deleteConversation,
      loading,
      searchConversations,
      searchResults,
    };
  }, [
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    loading,
    searchConversations,
    searchResults,
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
