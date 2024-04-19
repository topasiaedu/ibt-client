/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";
import { useMessages } from "../../../hooks/whatsapp/useMessages";
import LoadingPage from "../../pages/loading";
import { supabase } from '../../../utils/supabaseClient';
import { Conversation, Message, MessagesFormData } from '../../../types/messagesTypes';

const ConversationPage: React.FC = function () {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const { conversations, isLoading } = useMessages();
  const [tempConversations, setConversations] = useState<Conversation[]>([]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  useEffect(() => {
    setConversations(conversations);
    console.log('Subscribing to messages channel');
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        console.log('Received new message:', payload.new as Message)
        // Insert new message to messages and conversations appropriately
        const newMessage = payload.new as Message;

        // Update conversations
        setConversations(prev => {
          const contact_id = newMessage.contact_id;
          const conversationIndex = prev.findIndex(conversation => {
            const condition1 = conversation.contact_id === contact_id;
            const condition2 = conversation.phone_number_id === newMessage.phone_number_id;
            return condition1 && condition2;
          });

          if (conversationIndex === -1) {
            return prev;
          }

          const updatedConversations = [...prev];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            last_message: newMessage.content,
            unread_messages: updatedConversations[conversationIndex].unread_messages + 1,
            messages: [newMessage, ...updatedConversations[conversationIndex].messages]
          };

          return updatedConversations;
        });

        // Check if the new message is part of the selected conversation
        if (selectedConversation?.contact_id === newMessage.contact_id) {
          setSelectedConversation(prev => {
            if (!prev) {
              return prev;
            }

            return {
              ...prev,
              messages: [newMessage, ...prev.messages]
            };
          });
        }
      }).subscribe();

    return () => {
      console.log('Unsubscribing from messages channel');
      subscription.unsubscribe();
    };

  }, [conversations, selectedConversation]);

  if (isLoading) {
    return (
      <LoadingPage />
    );
  }

  if (!tempConversations.length) {
    return (
      <NavbarSidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold dark:text-white">No conversations found</h1>
          </div>
        </div>
      </NavbarSidebarLayout>
    );
  }

  console.log('conversations:', conversations || 'No conversations yet! 😢');


  return (
    <NavbarSidebarLayout>
      <div className="relative grid grid-cols-1 overflow-y-hidden xl:h-[calc(100vh-7rem)] xl:grid-cols-4 xl:gap-4">
        <ChatList
          conversations={tempConversations}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
        />
        {selectedConversation && (<ChatWindow conversation={selectedConversation} />)}
        {selectedConversation && (<ContactProfile contact={selectedConversation.contact} />)}
        {!selectedConversation && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold dark:text-white">Select a conversation to start chatting</h1>
            </div>
          </div>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};




export default ConversationPage;
