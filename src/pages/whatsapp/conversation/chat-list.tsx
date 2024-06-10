import { Badge, Dropdown, Label, TextInput } from "flowbite-react";
import React from "react";
import { Conversation } from "../../../context/MessagesContext";

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | undefined; // ID of the selected conversation
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversation,
}) => {
  const [phoneNumbers, setPhoneNumbers] = React.useState<string[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");

  // Get all unique phone numbers
  conversations.forEach((conversation) => {
    // This checks if the phone number is already in the list.
    if (!phoneNumbers.includes(conversation.phone_number.number)) {
      // Use the callback form of setPhoneNumbers to ensure the phoneNumbers array is current at the time of the update.
      setPhoneNumbers((prevPhoneNumbers) => {
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

  // Convert the last message time to a human-readable format and add 8 hour to match GMT+8
  const lastMessageTime = (time: string) => {
    const date = new Date(time);
    date.setHours(date.getHours() + 8);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="overflow-y-auto h-full divide-gray-200 dark:divide-gray-700">
      <div className="p-4 bg-white dark:bg-gray-800 flex justify-between items-center space-x-4">
        <form className="lg:pr-3">
          <Label htmlFor="users-search" className="sr-only">
            Search
          </Label>
          <div className="relative mt-1 lg:w-32 xl:w-48">
            <TextInput
              id="users-search"
              name="users-search"
              placeholder="Search for users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        <Dropdown label={selectedPhoneNumber || "All"} dismissOnClick={true}>
          <Dropdown.Item onClick={() => setSelectedPhoneNumber("")}>
            All
          </Dropdown.Item>
          {phoneNumbers.map((phoneNumber, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => setSelectedPhoneNumber(phoneNumber)}>
              {phoneNumber}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-grow">
        {conversations
          .sort(
            (a, b) =>
              new Date(b.last_message_time).getTime() -
              new Date(a.last_message_time).getTime()
          )
          .filter(
            (conversation) =>
              (conversation.phone_number.number.includes(selectedPhoneNumber) ||
                selectedPhoneNumber === "") &&
              conversation.contact.wa_id.includes(search)
          )
          .map((conversation, index) => (
            <li
              key={index}
              className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${
                selectedConversation === conversation
                  ? "bg-gray-200 dark:bg-gray-700"
                  : ""
              }`}
              onClick={() => onSelectConversation(conversation)}>
              <div className="flex justify-between 2xl:space-x-4 items-center">
                <div className="flex space-x-4 xl:mb-4 2xl:mb-0 w-full items-center">
                  <div className="min-w-0 flex-1 w-fit">
                    <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white flex items-center gap-x-2">
                      {conversation.contact.wa_id}{" "}
                      <Badge color="primary">
                        {conversation.phone_number.number}
                      </Badge>
                    </p>
                    <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                      {conversation.last_message.message_type === "text"
                        ? conversation.last_message.content
                        : conversation.last_message.message_type}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Last seen:{" "}
                      {lastMessageTime(conversation.last_message_time)}
                    </p>
                  </div>
                  {conversation.unread_messages > 0 && (
                    <Badge color="primary">
                      {conversation.unread_messages}
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ChatList;
