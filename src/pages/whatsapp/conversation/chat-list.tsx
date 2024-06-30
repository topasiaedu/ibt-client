import React, { useState } from "react";
import { Badge, Dropdown, Label, TextInput } from "flowbite-react";
import { Conversation } from "../../../context/MessagesContext";

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | undefined; // ID of the selected conversation
  onMarkAsUnread: (conversation: Conversation) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversation,
  onMarkAsUnread,
}) => {
  const [phoneNumbers, setPhoneNumbers] = React.useState<string[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuConversation, setContextMenuConversation] = useState<
    Conversation | undefined
  >(undefined);

  // Get all unique phone numbers
  conversations.forEach((conversation) => {
    if (!phoneNumbers.includes(conversation.phone_number.number)) {
      setPhoneNumbers((prevPhoneNumbers) => {
        if (!prevPhoneNumbers.includes(conversation.phone_number.number)) {
          return [...prevPhoneNumbers, conversation.phone_number.number];
        }
        return prevPhoneNumbers;
      });
    }
  });

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

  const handleContextMenu = (
    event: React.MouseEvent,
    conversation: Conversation
  ) => {
    event.preventDefault();
    setContextMenuConversation(conversation);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  };

  const handleClick = () => {
    setContextMenuVisible(false);
  };

  const handleMenuOptionClick = (option: string) => {
    if (option === "Mark as Unread" && contextMenuConversation !== undefined) {
      onMarkAsUnread(contextMenuConversation);
    }
    setContextMenuVisible(false);
  };

  return (
    <div
      className="overflow-y-auto h-full divide-gray-200 dark:divide-gray-700"
      onClick={handleClick}>
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
              onClick={() => onSelectConversation(conversation)}
              onContextMenu={(e) => handleContextMenu(e, conversation)}>
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
      {contextMenuVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0"
          onClick={handleClick}>
          <div
            className="absolute z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
            style={{ top: menuPosition.y, left: menuPosition.x }}>
            <ul>
              <li>
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleMenuOptionClick("Mark as Unread")}>
                  Mark as Unread
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
