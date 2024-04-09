/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";
import { useMessages } from "../../../hooks/whatsapp/useMessages";
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

  return (
    <NavbarSidebarLayout>
      <div className="relative grid grid-cols-1 overflow-y-hidden xl:h-[calc(100vh-7rem)] xl:grid-cols-4 xl:gap-4">
        <ChatList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedIndex={selectedIndex}
        />
        <ChatWindow conversation={conversations[selectedIndex]} />
        <ContactProfile contact={conversations[selectedIndex].contact} />
      </div>
    </NavbarSidebarLayout>
  );
};




export default ConversationPage;
