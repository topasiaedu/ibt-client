import {
  Badge,
  Dropdown
} from "flowbite-react";
import React from "react";
import { Conversation } from "../../../context/MessagesContext";

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | undefined; // ID of the selected conversation
}

const ChatList: React.FC<ChatListProps> = ({ conversations, onSelectConversation, selectedConversation }) => {

  const [phoneNumbers, setPhoneNumbers] = React.useState<string[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = React.useState<string>("");

  // Get all unique phone numbers
  conversations.forEach((conversation) => {
    // This checks if the phone number is already in the list.
    if (!phoneNumbers.includes(conversation.phone_number.number)) {
      // Use the callback form of setPhoneNumbers to ensure the phoneNumbers array is current at the time of the update.
      setPhoneNumbers(prevPhoneNumbers => {
        // Further check inside the updater function to avoid race conditions
        if (!prevPhoneNumbers.includes(conversation.phone_number.number)) {
          // Return a new array with the new number added
          return [...prevPhoneNumbers, conversation.phone_number.number];
        }
        // If the number is already included, return the previous state
        return prevPhoneNumbers;
      });
    }
  });

  return (
    <div className="overflow-y-auto h-full divide-gray-200 dark:divide-gray-700">
      <div className="p-4 bg-white dark:bg-gray-800">
        <Dropdown label={selectedPhoneNumber || "All"} dismissOnClick={true}>
          <Dropdown.Item onClick={() => setSelectedPhoneNumber("")}>
            All
          </Dropdown.Item>
          {phoneNumbers.map((phoneNumber, index) => (
            <Dropdown.Item key={index} onClick={() => setSelectedPhoneNumber(phoneNumber)}>
              {phoneNumber}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {conversations
          .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
          .filter((conversation) => selectedPhoneNumber === "" || conversation.phone_number.number === selectedPhoneNumber)
          .map((conversation, index) => (
            <li
              key={index}
              className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${selectedConversation === conversation ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex justify-between xl:block 2xl:block 2xl:space-x-4">
                <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white flex items-center gap-x-2">
                      {conversation.contact.wa_id} <Badge color="primary">{conversation.whatsapp_business_account.name}</Badge>
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
