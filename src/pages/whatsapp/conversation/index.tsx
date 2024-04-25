/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";
import LoadingPage from "../../pages/loading";
import { useMessagesContext, Conversation } from "../../../context/MessagesContext";

const ConversationPage: React.FC = function () {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const { conversations, loading } = useMessagesContext();

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  if (!conversations.length) {
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
          conversations={conversations}
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
