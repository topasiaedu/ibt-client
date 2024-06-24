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
import {
  WhatsAppBusinessAccount,
  useWhatsAppBusinessAccountContext,
} from "./WhatsAppBusinessAccountContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Messages = { messages: Message[] };
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

const WHATSAPP_ACCESS_TOKEN =
  "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

export type Conversation = {
  id: string;
  contact: Contact;
  messages: Message[];
  phone_number: PhoneNumber;
  whatsapp_business_account: WhatsAppBusinessAccount;
  last_message_time: string;
  last_message: Message;
  unread_messages: number;
  close_at: string | null;
};

interface MessagesContextType {
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: number) => void;
  addMessage: (message: MessageInsert, file?: File) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: number) => void;
  fetchCampaignReadMessagesCount: (
    campaignId: number
  ) => Promise<number | undefined>;
  loading: boolean;
}

const MessagesContext = createContext<MessagesContextType>(undefined!);

export const MessagesProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const { contacts } = useContactContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();

  console.log("MessagesProvider render"); // Add this line to log renders

  useEffect(() => {
    setLoading(true);

    const fetchConversations = async () => {
      if (!currentProject) return;
      // CREATE OR REPLACE FUNCTION fetch_conversations(project_id_param INT)

      const { data, error } = await supabase.rpc("fetch_conversations", {
        project_id_param: currentProject.project_id,
      });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (!data) return;

      const conversations = data as Conversation[];

      setConversations((prevConversations) => {
        if (!isEqual(prevConversations, conversations)) {
          console.log("Updating campaigns state");
          return conversations;
        }
        return prevConversations;
      });
    };

    fetchConversations();

    const handleChanges = (payload: any) => {
      switch (payload.eventType) {
        case "INSERT":
          console.log("INSERT event triggered"); // Add this line
          const conversationId = `${payload.new.contact_id}-${payload.new.phone_number_id}`;
          const existingConversation = conversations.find(
            (conversation) => conversation.id === conversationId
          );

          if (existingConversation) {
            const newConversation = {
              ...existingConversation,
              messages: [payload.new, ...existingConversation.messages],
              last_message_time: payload.new.created_at,
              last_message: payload.new,
              unread_messages:
                payload.new.status === "READ" &&
                payload.new.direction === "inbound"
                  ? 0
                  : existingConversation.unread_messages + 1,
            };

            const newConversations = conversations.map((conversation) =>
              conversation.id === conversationId
                ? newConversation
                : conversation
            );
            setConversations(newConversations);
          } else {
            // If conversation does not exist, create a new conversation
            const contact = contacts.find(
              (contact) => contact.contact_id === payload.new.contact_id
            );
            const phoneNumber = phoneNumbers.find(
              (phoneNumber) =>
                phoneNumber.phone_number_id === payload.new.phone_number_id
            );
            const whatsappBusinessAccount = whatsAppBusinessAccounts.find(
              (whatsappBusinessAccount) =>
                whatsappBusinessAccount.account_id === phoneNumber?.waba_id
            );
            const lastMessageTime = payload.new.created_at;
            const lastMessage = payload.new.content;
            const unreadMessages =
              payload.new.status === "READ" &&
              payload.new.direction === "inbound"
                ? 0
                : 1;

            if (!contact || !phoneNumber || !whatsappBusinessAccount) return;

            const newConversations = [
              {
                id: `${payload.new.contact_id}-${payload.new.phone_number_id}`,
                contact,
                messages: [payload.new],
                phone_number: phoneNumber,
                whatsapp_business_account: whatsappBusinessAccount,
                last_message_time: lastMessageTime,
                last_message: lastMessage,
                unread_messages: unreadMessages,
                close_at: null,
              },
              ...conversations,
            ];

            setConversations(newConversations);
          }
          break;
        case "UPDATE":
          console.log("UPDATE event triggered"); // Add this line
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.messages.some(
                (message) => message.message_id === payload.new.message_id
              )
                ? {
                    ...conversation,
                    messages: conversation.messages.map((message) =>
                      message.message_id === payload.new.message_id
                        ? payload.new
                        : message
                    ),
                  }
                : conversation
            )
          );
          break;
        case "DELETE":
          console.log("DELETE event triggered"); // Add this line
          setConversations((prev) =>
            prev.filter((conversation) =>
              conversation.messages.some(
                (message) => message.message_id !== payload.old.message_id
              )
            )
          );
          break;
      }
    };

    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [
    contacts,
    conversations,
    currentProject,
    phoneNumbers,
    whatsAppBusinessAccounts,
  ]);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev]);
  }, []);
  const updateConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.contact.contact_id === conversation.contact.contact_id
          ? conversation
          : c
      )
    );
  }, []);

  const deleteConversation = useCallback((conversationId: number) => {
    setConversations((prev) =>
      prev.filter(
        (conversation) => conversation.contact.contact_id !== conversationId
      )
    );
  }, []);

  const addMessage = useCallback(
    async (message: MessageInsert, file?: File) => {
      try {
        const phoneNumber = phoneNumbers.find(
          (phoneNumber) =>
            phoneNumber.phone_number_id === message.phone_number_id
        );

        console.log("access token", WHATSAPP_ACCESS_TOKEN);
        console.log("phone number", phoneNumber?.wa_id);

        let body = JSON.stringify({
          messaging_product: "whatsapp",
          to: contacts.find(
            (contact) => contact.contact_id === message.contact_id
          )?.wa_id,
        });

        let randomFileName = Math.random().toString(36).substring(7);

        // Check if file is present if so change the body to include the file
        if (file) {
          const { error } = await supabase.storage
            .from("media")
            .upload(`${randomFileName}`, file!, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

          if (error) {
            console.error("Error uploading file:", error);
            showAlert("Error uploading file", "error");
            return;
          }

          console.log("Random File Name", randomFileName);

          // Check if there is caption for the file
          if (message.content) {
            body = JSON.stringify({
              messaging_product: "whatsapp",
              to: contacts.find(
                (contact) => contact.contact_id === message.contact_id
              )?.wa_id,
              type: message.message_type,
              [message.message_type]: {
                link: `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`,
                caption: message.content,
              },
            });
          } else {
            body = JSON.stringify({
              messaging_product: "whatsapp",
              to: contacts.find(
                (contact) => contact.contact_id === message.contact_id
              )?.wa_id,
              type: message.message_type,
              [message.message_type]: {
                link: `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`,
              },
            });
          }
        } else if (message.message_type === "audio") {
          // Upload file to the following api to get the media id
          // curl - X POST 'https://graph.facebook.com/v19.0/<MEDIA_ID>/media' \
          // -H 'Authorization: Bearer <ACCESS_TOKEN>' \
          // -F 'file=@"2jC60Vdjn/cross-trainers-summer-sale.jpg"' \
          // -F 'type="image/jpeg"' \
          // -F 'messaging_product="whatsapp"'
          const form = new FormData();
          form.append("messaging_product", "whatsapp");
          // form.append('file', file);
          // form.append('type', file.type || 'audio/mpeg'); // Explicitly setting MIME type

          // console log out file in the form data
          console.log("form", form.get("file"));

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${phoneNumber?.wa_id}/media`,
            {
              method: "POST",
              headers: {
                Authorization: WHATSAPP_ACCESS_TOKEN,
              },
              body: form,
            }
          );

          console.log("response", response);

          const data = await response.json();

          console.log("data", data);

          body = JSON.stringify({
            messaging_product: "whatsapp",
            to: contacts.find(
              (contact) => contact.contact_id === message.contact_id
            )?.wa_id,
            type: "audio",
            audio: {
              id: data.id,
            },
          });
        } else {
          
          body = JSON.stringify({
            messaging_product: "whatsapp",
            to: contacts.find(
              (contact) => contact.contact_id === message.contact_id
            )?.wa_id,
            type: "text",
            text: {
              body: message.content,
            },
          });
          console.log("body", body);
        }
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${phoneNumber?.wa_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: WHATSAPP_ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            body: body,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Error sending message:", response.statusText);
          showAlert("Error sending message", "error");
          return;
        }

        // Add message to database
        const { error } = await supabase.from("messages").insert({
          ...message,
          project_id: currentProject?.project_id,
          wa_message_id: data.messages[0].id,
          media_url: file
            ? `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`
            : null,
        });

        if (error) {
          console.error("Error sending message:", error);
          showAlert("Error sending message", "error");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        showAlert("Error sending message", "error");
      }
    },
    [contacts, currentProject, phoneNumbers, showAlert]
  );

  const updateMessage = useCallback(
    async (message: Message) => {
      const { error } = await supabase
        .from("messages")
        .update({
          ...message,
          project_id: currentProject?.project_id,
        })
        .eq("message_id", message.message_id);

      if (error) {
        console.error("Error updating message:", error);
        showAlert("Error updating message", "error");
      }
    },
    [currentProject?.project_id, showAlert]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("message_id", messageId);

      if (error) {
        console.error("Error deleting message:", error);
        showAlert("Error deleting message", "error");
      }
    },
    [showAlert]
  );

  const fetchCampaignReadMessagesCount = useCallback(
    async (campaignId: number) => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("message_id")
        .eq("project_id", currentProject?.project_id)
        .eq("campaign_id", campaignId)
        .eq("status", "read");

      if (error) {
        console.error("Error fetching campaign read messages count:", error);
        return;
      }

      return messages?.length;
    },
    [currentProject]
  );

  const contextValue = useMemo(
    () => ({
      conversations,
      addConversation,
      updateConversation,
      deleteConversation,
      addMessage,
      updateMessage,
      deleteMessage,
      fetchCampaignReadMessagesCount,
      loading,
    }),
    [
      conversations,
      loading,
      addConversation,
      updateConversation,
      deleteConversation,
      addMessage,
      updateMessage,
      deleteMessage,
      fetchCampaignReadMessagesCount,
    ]
  );

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
};

// Add the whyDidYouRender property after defining the component
(MessagesProvider as any).whyDidYouRender = true; // Add this line

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error("useMessagesContext must be used within MessagesProvider");
  }

  return context;
};
