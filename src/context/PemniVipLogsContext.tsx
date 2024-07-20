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
import { useAlertContext } from "./AlertContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison
import { Contact } from "./ContactContext";

const WHATSAPP_ACCESS_TOKEN =
  "Bearer " + process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

export type PemniVipLog =
  Database["public"]["Tables"]["pemni_vip_logs"]["Row"] & {
    contact: Contact;
  };
export type PemniVipLogs = { pemniVipLogs: PemniVipLog[] };

interface PemniVipLogsContextType {
  pemniVipLogs: PemniVipLog[];
  loading: boolean;
  retry: (contact: Contact, password?: string) => Promise<void>;
}

const PemniVipLogsContext = createContext<PemniVipLogsContextType>(undefined!);

export const PemniVipLogsProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [pemniVipLogs, setPemniVipLogs] = useState<PemniVipLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchPemniVipLogs = async () => {
      const { data: pemniVipLogs, error } = await supabase
        .from("pemni_vip_logs")
        .select("*, contact:contact_id(*)");

      if (error) {
        showAlert(error.message, "error");
      } else {
        setPemniVipLogs(pemniVipLogs || []);
      }

      setLoading(false);
    };

    fetchPemniVipLogs();
  }, [showAlert]);

  const retry = useCallback(
    async (contact: Contact, password?: string) => {
      setLoading(true);
      let body;
      if (!password) {
        body = JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contact.wa_id,
          type: "template",
          template: {
            name: "existing_user_vip_onboard_v2",
            language: {
              code: "zh_CN",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: contact.name,
                  },
                  {
                    type: "text",
                    text: contact.email || "",
                  },
                  {
                    type: "text",
                    text: "https://bit.ly/vip-tutorial",
                  },
                  {
                    type: "text",
                    text: "https://pemnitan.com/vip-zoom",
                  },
                ],
              },
            ],
          },
        });
      } else {
        body = JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contact.wa_id,
          type: "template",
          template: {
            name: "new_user_vip_onboard_v2",
            language: {
              code: "zh_CN",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: contact.name,
                  },
                  {
                    type: "text",
                    text: contact.email || "",
                  },
                  {
                    type: "text",
                    text: password,
                  },
                  {
                    type: "text",
                    text: "https://bit.ly/vip-tutorial",
                  },
                  {
                    type: "text",
                    text: "https://pemnitan.com/vip-zoom",
                  },
                ],
              },
            ],
          },
        });
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/220858504440106/messages`,
        {
          method: "POST",
          headers: {
            Authorization: WHATSAPP_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
          body: body,
        }
      );

      if (!response.ok) {
        console.error("Error sending message:", response);  
        showAlert("Error sending message", "error");
      } else {
        const responseData = await response.json();

        var conversationId = "";
        // Look Up Conversation ID
        const { data: conversationData, error: conversationError } =
          await supabase
            .from("conversations")
            .select("id")
            .eq("phone_number_id", "5")
            .eq("contact_id", contact.contact_id)
            .single();

        if (conversationError) {
          // Create a new conversation if not found
          const { data: newConversationData, error: newConversationError } =
            await supabase
              .from("conversations")
              .insert([
                {
                  phone_number_id: "5",
                  contact_id: contact.contact_id,
                  project_id: "2",
                },
              ])
              .select("*")
              .single();
          if (newConversationError) {
            console.error(
              "Error creating new conversation:",
              newConversationError
            );
          }
          conversationId = newConversationData.id;
        } else {
          conversationId = conversationData.id;
        }
        // Insert the message into the messages table

        if (password) {
        
          const { data: newMessage, error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                wa_message_id: (responseData as any).messages[0].id || "",
                phone_number_id: "5",
                contact_id: contact.contact_id,
                message_type: "TEMPLATE",
                content: `亲爱的${contact.name}，\n.\n🎉 恭喜你成功加人生GPS - VIP 福利包！🎉\n.\n你的会员新账号已经创建好啦，赶紧按照下面步骤来开始吧：\n.\n*【如果你是第一次登入】*\n*(1) 打开会员网站: https://mylifedecode.com/*\n*(2) 用以下信息通过电子邮件登录：*\n   *- 电子邮件:* ${contact.email}\n   *- 密码:* ${password}\n\n*(3) 登录后点击 <VIP福利包> 就可以观看啦！*\n.\n*【如果你已经是网站会员】*\n*(1) 打开会员网站 https://mylifedecode.com/*\n*(2) 用facebook登入*\n*(3) 登录后点击 <VIP福利包> 就可以观看啦！*\n.\n🎈还不是很清楚怎么登入？\n点击观看，会一步一步教你：\n>> https://bit.ly/vip-tutorial\n.\n*Here's your Zoom Link to enter VIP Room:*\n👉 https://pemnitan.com/vip-zoom\n.\n.\n如果有任何问题或需要帮助，随时联系我们哟。祝你学习愉快！😊\n.\n>> Support: 6011-5878 5417\n>> Serene: 6011-20560692\n.\nMaster Pemni 团队`,
                direction: "outgoing",
                status:
                  (responseData as any).messages[0].message_status || "failed",
                project_id: "2",
                conversation_id: conversationId,
              },
            ])
            .select("*")
            .single();

          if (messageError) {
            console.error("Error inserting message:", messageError);
          }

          // Update to conversation to have the latest message
          await supabase
            .from("conversations")
            .update({
              latest_message_id: newMessage.id,
            })
            .eq("id", conversationId);
        } else {
          const { data: newMessage, error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                wa_message_id: (responseData as any).messages[0].id || "",
                phone_number_id: "5",
                contact_id: contact.contact_id,
                message_type: "TEMPLATE",
                content: `亲爱的${contact.name}，\n.\n🎉 恭喜你成功加人生GPS - VIP 福利包！🎉\n.\n你的会员新账号已经创建好啦，赶紧按照下面步骤来开始吧：\n.\n*【如果你是第一次登入】*\n*(1) 打开会员网站: https://mylifedecode.com/*\n*(2) 用以下信息通过电子邮件登录：*\n   *- 电子邮件:* ${contact.email}\n   *\n\n*(3) 登录后点击 <VIP福利包> 就可以观看啦！*\n.\n*【如果你已经是网站会员】*\n*(1) 打开会员网站 https://mylifedecode.com/*\n*(2) 用facebook登入*\n*(3) 登录后点击 <VIP福利包> 就可以观看啦！*\n.\n🎈还不是很清楚怎么登入？\n点击观看，会一步一步教你：\n>> https://bit.ly/vip-tutorial\n.\n*Here's your Zoom Link to enter VIP Room:*\n👉 https://pemnitan.com/vip-zoom\n.\n.\n如果有任何问题或需要帮助，随时联系我们哟。祝你学习愉快！😊\n.\n>> Support: 6011-5878 5417\n>> Serene: 6011-20560692\n.\nMaster Pemni 团队`,
                direction: "outgoing",
                status:
                  (responseData as any).messages[0].message_status || "failed",
                project_id: "2",
                conversation_id: conversationId,
              },
            ])
            .select("*")
            .single();

          if (messageError) {
            console.error("Error inserting message:", messageError);
          }

          // Update to conversation to have the latest message
          await supabase
            .from("conversations")
            .update({
              latest_message_id: newMessage.id,
            })
            .eq("id", conversationId);
        }

        // Update to the table pemni_vip_logs
        await supabase.from("pemni_vip_logs").insert([
          {
            contact_id: contact.contact_id,
            password: password,
            status: "SUCCESS",
          },
        ]);
      }

      showAlert("Message sent successfully", "success");
      setLoading(false);
    },
    [showAlert]
  );

  return (
    <PemniVipLogsContext.Provider value={{ pemniVipLogs, loading, retry }}>
      {children}
    </PemniVipLogsContext.Provider>
  );
};

export const usePemniVipLogsContext = () => {
  const context = useContext(PemniVipLogsContext);
  if (!context) {
    throw new Error(
      "usePemniVipLogsContext must be used within a PemniVipLogsProvider"
    );
  }

  return context;
};
