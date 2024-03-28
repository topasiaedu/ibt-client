import React from "react";

interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  lastSeen: string;
  last_message: string;
}

interface ChatListProps {
  conversations: Conversation[];
  onSelect: (conversationId: string) => void; // Function to handle selection
  selectedConversationId: string | null; // ID of the selected conversation
}

const ChatList: React.FC<ChatListProps> = ({ conversations, onSelect, selectedConversationId }) => {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <li
          key={conversation.id}
          className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${selectedConversationId === conversation.id ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          onClick={() => onSelect(conversation.id)}
        >
          <div className="flex justify-between xl:block 2xl:flex 2xl:space-x-4">
            <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
              <div>
                <img
                  alt={conversation.name}
                  src={conversation.avatarUrl}
                  className="h-6 w-6 rounded-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white">
                  {conversation.name}
                </p>
                <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {conversation.last_message}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Last seen: {conversation.lastSeen}
                </p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ChatList;
