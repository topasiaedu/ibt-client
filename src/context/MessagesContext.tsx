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
import { useContactContext } from "./ContactContext";
import { usePhoneNumberContext } from "./PhoneNumberContext";
import { useWhatsAppBusinessAccountContext } from "./WhatsAppBusinessAccountContext";
import isEqual from "lodash.isequal";
import { Conversation } from "./ConversationContext";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Messages = { messages: Message[] };
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

const WHATSAPP_ACCESS_TOKEN =
  "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

interface MessagesContextType {
  messages: Message[];
  addMessage: (
    message: MessageInsert,
    conversation_id: string,
    to: string,
    file?: File
  ) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: number) => void;
  fetchCampaignReadMessagesCount: (
    campaignId: number
  ) => Promise<number | undefined>;
  loading: boolean;
  currentConversationId: string | null;
  setCurrentConversationId: (conversationId: string | null) => void;
  sendReEngagementMessage: (conversation: Conversation) => void;
}

const MessagesContext = createContext<MessagesContextType>(undefined!);

export const MessagesProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const { contacts } = useContactContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();

  useEffect(() => {
    setLoading(true);

    const fetchMessages = async () => {
      if (!currentConversationId) return;

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("message_id", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages((prevMessages) => {
        if (isEqual(prevMessages, messages)) return prevMessages;
        return messages;
      });
    };

    fetchMessages();

    const handleChanges = (payload: any) => {
      console.log("Inside handleChanges, event type: ", payload.eventType);
      if (payload.eventType === "INSERT") {
        if (payload.new.conversation_id === currentConversationId) {
          setMessages((prev) => [payload.new, ...prev]);
        }
      } else if (payload.eventType === "UPDATE") {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) =>
            message.message_id === payload.new.message_id
              ? payload.new
              : message
          );
          if (!isEqual(prev, updatedMessages)) {
            return updatedMessages;
          }
          return prev;
        });
      } else if (payload.eventType === "DELETE") {
        setMessages((prev) =>
          prev.filter(
            (message) => message.message_id !== payload.old.message_id
          )
        );
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
    currentConversationId,
    currentProject,
    phoneNumbers,
    whatsAppBusinessAccounts,
  ]);

  const addMessage = useCallback(
    async (
      message: MessageInsert,
      conversation_id: string,
      to: string,
      file?: File
    ) => {
      try {
        const phoneNumber = phoneNumbers.find(
          (phoneNumber) =>
            phoneNumber.phone_number_id === message.phone_number_id
        );

        let body = JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
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

          // Check if there is caption for the file
          if (message.content) {
            body = JSON.stringify({
              messaging_product: "whatsapp",
              to: to,
              type: message.message_type,
              [message.message_type]: {
                link: `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`,
                caption: message.content,
              },
            });
          } else {
            body = JSON.stringify({
              messaging_product: "whatsapp",
              to: to,
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

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${phoneNumber?.wa_id}/media`,
            {
              method: "POST",
              headers: {
                Authorization:
                  phoneNumber?.wa_id === "378967558625481"
                    ? "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN_2
                    : "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN,
              },
              body: form,
            }
          );

          const data = await response.json();

          body = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "audio",
            audio: {
              id: data.id,
            },
          });
        } else {
          body = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: {
              body: message.content,
            },
          });
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
          console.error("Payload:", body, WHATSAPP_ACCESS_TOKEN);
          console.error("Error sending message:", response);
          showAlert("Error sending message", "error");
          return;
        }

        // Add message to database
        const { data: newMessage, error } = await supabase
          .from("messages")
          .insert({
            ...message,
            project_id: currentProject?.project_id,
            wa_message_id: data.messages[0].id,
            conversation_id: conversation_id,
            media_url: file
              ? `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`
              : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error sending message:", error);
          showAlert("Error sending message", "error");
        }

        // Update last_message_id and updated_at in the conversation
        const { error: updateConversationError } = await supabase
          .from("conversations")
          .update({
            last_message_id: newMessage?.message_id,
            updated_at: new Date(),
          })
          .eq("id", conversation_id);

        if (updateConversationError) {
          console.error(
            "Error updating conversation with last_message_id:",
            updateConversationError
          );
          return;
        }
      } catch (error) {
        console.error("Error sending message:", error);
        showAlert("Error sending message", "error");
      }
    },
    [currentProject, phoneNumbers, showAlert]
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

  const sendReEngagementMessage = useCallback(
    async (conversation: Conversation) => {
      const body = JSON.stringify({
        messaging_product: "whatsapp",
        to: conversation.contact?.wa_id,
        type: "template",
        template: {
          name: "pemni_re_engagement_message",
          language: {
            code: "zh_CN",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: conversation.contact?.name,
                },
              ],
            },
          ],
        },
      });

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${conversation.phone_number.wa_id}/messages`,
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
        console.error("Error sending re-engagement message:", response);
        showAlert("Error sending re-engagement message", "error");
        return;
      }

      // Add message to database

      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert({
          project_id: currentProject?.project_id,
          wa_message_id: data.messages[0].id,
          phone_number_id: conversation.phone_number_id,
          contact_id: conversation.contact_id,
          conversation_id: conversation.id,
          message_type: "TEMPLATE",
          content: `嗨 ${conversation.contact?.name} 👋

由于这信息系统出现了些问题，无法马上回复您。

若您有任何关于上课的疑问请一律 whatsapp Serene: 
+6011-20560692 (Serene)
https://wa.link/v3pcls  

感谢您的理解 🙆🏼‍♀
`,
        } as MessageInsert)
        .select()
        .single();

      if (error) {
        console.error("Error sending re-engagement message:", error);
        showAlert("Error sending re-engagement message", "error");
      }

      // Update last_message_id and updated_at in the conversation
      const { error: updateConversationError } = await supabase
        .from("conversations")
        .update({
          last_message_id: newMessage?.message_id,
          updated_at: new Date(),
        })
        .eq("id", conversation.id);

      if (updateConversationError) {
        console.error(
          "Error updating conversation with last_message_id:",
          updateConversationError
        );
        return;
      }

      showAlert("Re-engagement message sent", "success");
    },
    [addMessage, currentProject, showAlert]
  );

  const contextValue = useMemo(
    () => ({
      messages,
      addMessage,
      updateMessage,
      deleteMessage,
      fetchCampaignReadMessagesCount,
      loading,
      currentConversationId,
      setCurrentConversationId,
      sendReEngagementMessage,
    }),
    [
      messages,
      addMessage,
      updateMessage,
      deleteMessage,
      fetchCampaignReadMessagesCount,
      loading,
      currentConversationId,
      setCurrentConversationId,
      sendReEngagementMessage,
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
