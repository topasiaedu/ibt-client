import React from "react";
import { Conversation } from "../../../types/messagesTypes";
import {
  Dropdown
} from "flowbite-react";

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (index: number) => void;
  selectedIndex: number | null; // ID of the selected conversation
}

const ChatList: React.FC<ChatListProps> = ({ conversations, onSelectConversation, selectedIndex }) => {

  const [phoneNumbers, setPhoneNumbers] = React.useState<string[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = React.useState<string>("");

  // Get all unique phone numbers
  conversations.forEach((conversation) => {
    console.log("conversation", conversation);
    if (!phoneNumbers.includes(conversation.phone_numbers.number)) {
      setPhoneNumbers(prev => [...prev, conversation.phone_numbers.number]);
    }
  });

  return (
    <div className="overflow-y-auto h-full divide-gray-200 dark:divide-gray-700">
      <div className="p-4 bg-white dark:bg-gray-800">
        <Dropdown label={selectedPhoneNumber||"All"} dismissOnClick={true}>
          {phoneNumbers.map((phoneNumber, index) => (
            <Dropdown.Item key={index} onClick={() => setSelectedPhoneNumber(phoneNumber)}>
              {phoneNumber}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {conversations.map((conversation, index) => (
          <li
            key={index}
            className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${selectedIndex === index ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            onClick={() => onSelectConversation(index)}
          >
            <div className="flex justify-between xl:block 2xl:flex 2xl:space-x-4">
              <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white">
                    {conversation.contact.wa_id}
                  </p>
                  <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                    {conversation.last_message}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Last seen: {new Date(conversation.last_message_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
