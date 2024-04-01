/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";
import { useMessages } from "../../../hooks/whatsapp/useMessages";
import { Conversation } from "../../../types/messagesTypes";
import LoadingPage from "../../pages/loading";

const ConversationPage: React.FC = function () {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { conversations, isLoading } = useMessages();

  const handleSelectConversation = (index: number) => {
    setSelectedIndex(index);
  };

  if (isLoading) {
    return (
      <LoadingPage />
    );
  }
  console.log(conversations);
  

  return (
    <NavbarSidebarLayout>
      <div className="relative grid grid-cols-1 overflow-y-hidden xl:h-[calc(100vh-7rem)] xl:grid-cols-4 xl:gap-4">
        <ChatList
          conversations={conversations}
          onSelect={handleSelectConversation}
          selectedIndex={selectedIndex}
        />
        <ChatWindow conversation={conversations[selectedIndex]} />
        {/* <ContactProfile /> */}
      </div>
    </NavbarSidebarLayout>
  );
};




export default ConversationPage;
