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

export type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  context_message: Message | null;
};
export type Messages = { messages: Message[] };
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

const WHATSAPP_ACCESS_TOKEN =
  "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

interface MessagesContextType {
  messages: Message[];
  addMessage: (
    message: MessageInsert,
    conversation_id: string,
    to: string,
    file?: File,
    context?: Message
  ) => void;
  updateMessage: (message: MessageUpdate) => void;
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
        .select("*, context_message:context(*)")
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
      console.log("Payload:", payload.eventType);
      if (payload.eventType === "INSERT") {
        // Check if there is context if so populate it
        if (payload.new.context) {
          payload.new.context_message = messages.find(
            (message) => message.message_id === payload.new.context.message_id
          );
        }

        if (payload.new.conversation_id === currentConversationId) {
          setMessages((prev) => [payload.new, ...prev]);
        }
      } else if (payload.eventType === "UPDATE") {
        setMessages((prev) => {
          // Check if there is context if so populate it
          if (payload.new.context) {
            payload.new.context_message = messages.find(
              (message) => message.message_id === payload.new.context.message_id
            );
          }

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
    messages,
    phoneNumbers,
    whatsAppBusinessAccounts,
  ]);

  const addMessage = useCallback(
    async (
      message: MessageInsert,
      conversation_id: string,
      to: string,
      file?: File,
      context?: Message
    ) => {
      try {
        const phoneNumber = phoneNumbers.find(
          (phoneNumber) =>
            phoneNumber.phone_number_id === message.phone_number_id
        );

        let body: any = {
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message.content },
          ...(context && { context: { message_id: context.wa_message_id } }),
        };

        const randomFileName = Math.random().toString(36).substring(7);
        const mediaLink = `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/${randomFileName}`;

        if (file) {
          const { error } = await supabase.storage
            .from("media")
            .upload(`${randomFileName}`, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

          if (error) {
            console.error("Error uploading file:", error);
            showAlert("Error uploading file", "error");
            return;
          }

          if (message.message_type !== "audio") {
            body = {
              messaging_product: "whatsapp",
              to: to,
              type: message.message_type,
              [message.message_type]: {
                link: mediaLink,
                caption: message.content || undefined,
              },
              ...(context && {
                context: { message_id: context.wa_message_id },
              }),
            };
          } else {
            const form = new FormData();
            form.append("messaging_product", "whatsapp");
            form.append("file", file);

            const response = await fetch(
              `https://graph.facebook.com/v19.0/${phoneNumber?.wa_id}/media`,
              {
                method: "POST",
                headers: {
                  Authorization:
                    phoneNumber?.wa_id === "378967558625481"
                      ? "Bearer " +
                        process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN_2
                      : "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN,
                },
                body: form,
              }
            );

            const data = await response.json();

            if (!response.ok) {
              console.error("Error uploading audio:", data);
              showAlert("Error uploading audio", "error");
              return;
            }

            body = {
              messaging_product: "whatsapp",
              to: to,
              type: "audio",
              audio: { id: data.id },
              ...(context && {
                context: { message_id: context.wa_message_id },
              }),
            };
          }
        }

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${phoneNumber?.wa_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: WHATSAPP_ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Payload:", body);
          console.error("Error sending message:", data);
          showAlert("Error sending message", "error");
          return;
        }

        const { data: newMessage, error } = await supabase
          .from("messages")
          .insert({
            ...message,
            project_id: currentProject?.project_id,
            wa_message_id: data.messages[0].id,
            conversation_id: conversation_id,
            media_url: file ? mediaLink : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error sending message:", error);
          showAlert("Error sending message", "error");
          return;
        }

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
    async (message: MessageUpdate) => {
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

// const fetchMedia = async (
//   imageId: string,
//   randomFileName: string,
//   access_token: string
// ): Promise<string> => {
//   try {
//     const whatsappApiURL: string = 'https://graph.facebook.com/v19.0/'
//     console.log('Fetching image with ID:', imageId, randomFileName, access_token)
//     // Assume axios and headers are set up previously
//     const response = await fetch(`${whatsappApiURL}${imageId}`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     })

//     const responseData = await response.json()
//     console.log('Response:', responseData)

//     const proxyUrl = 'https://ibts3.whatsgenie.com/proxy?url=';
//     const targetUrl = responseData.url;

//     const data = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${access_token}`
//       }
//     });

//     if (!data.ok) {
//       throw new Error('Network response was not ok ' + data.statusText);
//     }

//     const mediaResponse = await data.arrayBuffer();

//     console.log('Media response:', mediaResponse)

//     const contentType = 'audio/ogg; codecs=opus'

//     // Upload the buffer directly to Supabase storage
//     const { data: uploadData, error } = await supabase.storage
//       .from('media')
//       .upload(randomFileName, mediaResponse, {
//         contentType: contentType,
//         upsert: true,
//       })

//     if (error) throw error

//     return (
//       `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/` +
//       uploadData.path
//     )
//   } catch (error) {
//     console.error('error:', error)
//     console.error('Error fetching or uploading image with ID:', imageId)
//     throw new Error('Failed to fetch or upload image')
//   }
// }
