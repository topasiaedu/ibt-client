import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';
import { useProjectContext } from './ProjectContext';
import { useAlertContext } from './AlertContext';
import { Contact, useContactContext } from './ContactContext';
import { PhoneNumber, usePhoneNumberContext } from './PhoneNumberContext';
import { WhatsAppBusinessAccount, useWhatsAppBusinessAccountContext } from './WhatsAppBusinessAccountContext';

export type Message = Database['public']['Tables']['messages']['Row'];
export type Messages = { messages: Message[] };
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export type Conversation = {
  id: string;
  contact: Contact;
  messages: Message[];
  phone_number: PhoneNumber;
  whatsapp_business_account: WhatsAppBusinessAccount;
  last_message_time: string;
  last_message: string;
  unread_messages: number;
};

interface MessagesContextType {
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: number) => void;
  addMessage: (message: MessageInsert) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: number) => void;
  loading: boolean;
}

const MessagesContext = createContext<MessagesContextType>(undefined!);

export const MessagesProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const { contacts } = useContactContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();

  useEffect(() => {
    setLoading(true);
    const fetchConversations = async () => {
      if (!currentProject) return;

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`*`)
        .order('message_id', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Loop through messages and group them by phone_number_id and fill up the conversation object
      let initialConversations: Conversation[] = [];

      messages?.forEach(async message => {
        const contact = contacts.find(contact => contact.contact_id === message.contact_id);
        const phoneNumber = phoneNumbers.find(phoneNumber => phoneNumber.phone_number_id === message.phone_number_id);
        const whatsappBusinessAccount = whatsAppBusinessAccounts.find(whatsappBusinessAccount => whatsappBusinessAccount.account_id === phoneNumber?.waba_id);
        const lastMessageTime = message.created_at;
        const lastMessage = message.content;
        const unreadMessages = message.status === 'READ' ? 0 : 1;

        // if any of them is undefined, skip this message
        if (!contact || !phoneNumber || !whatsappBusinessAccount) return;

        // Use contact_id - phone_number_id as the conversation id
        const conversationId = `${message.contact_id}-${message.phone_number_id}`;

        // Check if conversation already exists
        const existingConversation = initialConversations.find(conversation => conversation.id === conversationId);

        if (existingConversation) {
          existingConversation.messages.push(message);
          existingConversation.last_message_time = lastMessageTime;
          existingConversation.last_message = lastMessage;
          existingConversation.unread_messages += unreadMessages;
        } else {
          initialConversations.push({
            id: conversationId,
            contact,
            messages: [message],
            phone_number: phoneNumber,
            whatsapp_business_account: whatsappBusinessAccount,
            last_message_time: lastMessageTime,
            last_message: lastMessage,
            unread_messages: unreadMessages,
          });
        }
      });


      setConversations(initialConversations!);
    };

    fetchConversations();

    const handleChanges = (payload: any) => {
      switch (payload.eventType) {
        case 'INSERT':
          setConversations([payload.new, ...conversations]);
          break;
        case 'UPDATE':
          setConversations(prev => prev.map(conversation => conversation.messages.some(message => message.message_id === payload.new.message_id) ? { ...conversation, messages: conversation.messages.map(message => message.message_id === payload.new.message_id ? payload.new : message) } : conversation));
          break;
        case 'DELETE':
          setConversations(prev => prev.filter(conversation => conversation.messages.some(message => message.message_id !== payload.old.message_id)));
          break;
      }
    };

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        handleChanges(payload);
      })
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [contacts, currentProject, phoneNumbers, whatsAppBusinessAccounts]);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  const updateConversation = (conversation: Conversation) => {
    setConversations(prev => prev.map(c => c.contact.contact_id === conversation.contact.contact_id ? conversation : c));
  };

  const deleteConversation = (conversationId: number) => {    setConversations(prev => prev.filter(conversation => conversation.contact.contact_id !== conversationId));
  };

  const addMessage = async (message: MessageInsert) => {
    const { error } = await supabase.from('messages').insert({
      ...message,
      project_id: currentProject?.project_id,
    });

    if (error) {
      console.error('Error inserting message:', error);
      showAlert('Error inserting message', 'error');
    }
  }

  const updateMessage = async (message: Message) => {
    const { error } = await supabase.from('messages').update({
      ...message,
      project_id: currentProject?.project_id,
    }).eq('message_id', message.message_id);

    if (error) {
      console.error('Error updating message:', error);
      showAlert('Error updating message', 'error');
    }
  }

  const deleteMessage = async (messageId: number) => {
    const { error } = await supabase.from('messages').delete().eq('message_id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      showAlert('Error deleting message', 'error');
    }

  }

  return (
    <MessagesContext.Provider value={{ conversations, addConversation, updateConversation, deleteConversation, addMessage, updateMessage, deleteMessage, loading }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error('useMessagesContext must be used within MessagesProvider');
  }

  return context;
}