import { useState, useCallback, useEffect } from 'react';
import { Conversation, Message, MessagesFormData } from '../../types/messagesTypes';
import * as messageService from '../../services/messageService';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await messageService.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }
    , []);

  const fetchMessage = async (message_id: number) => {
    setIsLoading(true);
    try {
      const data = await messageService.getMessage(message_id);
      return data;
    } catch (error) {
      console.error('Failed to fetch message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const addMessage = async (formData: MessagesFormData) => {
    try {
      const newMessage = await messageService.createMessage(formData);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to add message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const updateMessage = async (message_id: number, formData: Message) => {
    setIsLoading(true);
    try {
      const updatedMessage = await messageService.updateMessage(message_id, formData);
      setMessages(prev => prev.map(message => message.message_id === message_id ? updatedMessage : message).filter(Boolean) as Message[]);
    } catch (error) {
      console.error('Failed to update message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteMessage = async (message_id: number) => {
    setIsLoading(true);
    try {
      await messageService.deleteMessage(message_id);
      setMessages(prev => prev.filter(message => message.message_id !== message_id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const getConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all messages
      const messages = await messageService.getMessages();

      // Group messages by contact_id and phone_number_id
      const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, message) => {
        const key = `${message.contact_id}-${message.phone_number_id}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(message);
        return acc;
      }, {});

      // Create conversations
      const conversations = Object.entries(groupedMessages).map(([key, messages]) => {
        const [contact_id, phone_number_id] = key.split('-').map(Number);
        return {
          contact_id: contact_id,
          phone_number_id: phone_number_id,
          last_message: messages[0].content,
          last_message_time: messages[0].created_at,
          unread_messages: messages.filter(message => !message.status).length,
          messages,
          contact: messages[0].contact,
          phone_numbers: {
            number: messages[0].phone_numbers.number,
            wa_id: messages[0].phone_numbers.wa_id,
            whatsapp_business_accounts: {
              waba_id: messages[0].phone_numbers.whatsapp_business_accounts.waba_id,
              name: messages[0].phone_numbers.whatsapp_business_accounts.name
            }
          }
        };
      });

      setConversations(conversations as Conversation[]);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    getConversations();
  }, [fetchMessages, getConversations]);


  return {
    conversations,
    messages,
    isLoading,
    fetchMessage,
    addMessage,
    updateMessage,
    deleteMessage,
    getConversations,
  };
}