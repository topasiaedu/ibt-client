/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import ChatList from "./chat-list";
import ChatWindow from "./chat-window";
import ContactProfile from "./contact-profile";
import LoadingPage from "../../pages/loading";
import { useMessagesContext } from "../../../context/MessagesContext";
import { useProjectContext } from "../../../context/ProjectContext";
import {
  useConversationContext,
  Conversation,
} from "../../../context/ConversationContext";

const ConversationPage: React.FC = function () {
  const [selectedConversation, setSelectedConversation] = useState<
    Conversation | undefined
  >(undefined);
  const { updateMessage, setCurrentConversationId, messages } =
    useMessagesContext();
  const { currentProject } = useProjectContext();
  const { conversations, loading, updateConversation } =
    useConversationContext();

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);

    // Mark all messages as read
    for (const message of messages) {
      if (message.status !== "READ" && message.direction === "inbound") {
        updateMessage({
          ...message,
          status: "READ",
        });
      }
    }

    updateConversation({
      id: conversation.id,
      phone_number_id: conversation.phone_number_id,
      contact_id: conversation.contact_id,
      project_id: conversation.project_id,
      last_message_id: conversation.last_message_id,
      close_at: conversation.close_at,
      unread_messages: 0,
    });
    setSelectedConversation(conversation);
  };

  const handleUnreadConversation = (conversation: Conversation) => {
    // Mark the first inbound message as UNREAD
    const firstInboundMessage = messages.find(
      (message) => message.direction === "inbound"
    );
    if (firstInboundMessage) {
      console.log(firstInboundMessage);
      updateMessage({
        ...firstInboundMessage,
        status: "UNREAD",
      });
    }
    
    updateConversation({
      id: conversation.id,
      phone_number_id: conversation.phone_number_id,
      contact_id: conversation.contact_id,
      project_id: conversation.project_id,
      last_message_id: conversation.last_message_id,
      close_at: conversation.close_at,
      unread_messages: 1,
    });
  };

  useEffect(() => {
    if (selectedConversation) {
      const updatedConversation = conversations.find(
        (conversation) => conversation.id === selectedConversation.id
      );
      if (updatedConversation) {
        // Mark all messages as read
        for (const message of messages) {
          if (message.status !== "READ" && message.direction === "inbound") {
            updateMessage({
              ...message,
              status: "READ",
            });
          }
        }
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations, messages, selectedConversation, updateMessage]);

  // If current project is changed, reset selected conversation
  useEffect(() => {
    setSelectedConversation(undefined);
  }, [currentProject]);

  if (loading || !conversations || !conversations.length) {
    return <LoadingPage />;
  }

  if (!conversations.length) {
    return (
      <NavbarSidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold dark:text-white">
              No conversations found
            </h1>
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
          selectedConversation={selectedConversation}
          onMarkAsUnread={handleUnreadConversation}
        />
        {selectedConversation && (
          <ChatWindow conversation={selectedConversation} messages={messages} />
        )}
        {selectedConversation && (
          <ContactProfile
            contact={selectedConversation.contact}
            close_at={selectedConversation.close_at}
          />
        )}
        {!selectedConversation && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                alt=""
                src="/images/illustrations/404.svg"
                className="lg:max-w-md"
              />
              <h1 className="text-2xl font-bold dark:text-white">
                Select a conversation to start chatting
              </h1>
            </div>
          </div>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default ConversationPage;
