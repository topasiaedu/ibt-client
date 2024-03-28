/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";

// Example conversation data
const conversations = [
  {
    id: "1",
    name: "Bonnie Green",
    last_message: "Hey, how are you?",
    lastSeen: "1 min ago",
    avatarUrl: "../../images/users/bonnie-green.png",
  },
  {
    id: "2",
    name: "Bonnie Green",
    last_message: "Hey, how are you?",
    lastSeen: "1 min ago",
    avatarUrl: "../../images/users/bonnie-green.png",
  },
  {
    id: "3",
    name: "Bonnie Green",
    last_message: "Hey, how are you?",
    lastSeen: "1 min ago",
    avatarUrl: "../../images/users/bonnie-green.png",
  },
  {
    id: "4",
    name: "Bonnie Green",
    last_message: "Hey, how are you?",
    lastSeen: "1 min ago",
    avatarUrl: "../../images/users/bonnie-green.png",
  },
  {
    id: "5",
    name: "Bonnie Green",
    last_message: "Hey, how are you?",
    lastSeen: "1 min ago",
    avatarUrl: "../../images/users/bonnie-green.png",
  },
  // Add more conversations here
];

const ConversationPage: React.FC = function () {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleSelectConversation = (conversationId: string) => {
    console.log("Selected conversation ID:", conversationId);
    setSelectedConversationId(conversationId);
  };

  return (
    <NavbarSidebarLayout>
      <div className="relative grid grid-cols-1 overflow-y-hidden xl:h-[calc(100vh-7rem)] xl:grid-cols-4 xl:gap-4">
        <ChatList
          conversations={conversations}
          onSelect={handleSelectConversation}
          selectedConversationId={selectedConversationId}
        />
        <ChatWindow />
        <ContactProfile />
      </div>
    </NavbarSidebarLayout>
  );
};




export default ConversationPage;
