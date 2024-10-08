import React, { useEffect, useState } from "react";
import { Badge, Checkbox, Dropdown, Label, TextInput } from "flowbite-react";
import {
  Conversation,
  useConversationContext,
} from "../../../context/ConversationContext";
import { PhoneNumber } from "../../../context/PhoneNumberContext";
import LoadingPage from "../../pages/loading";
import { useProjectContext } from "../../../context/ProjectContext";
import debounce from "lodash.debounce";

interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  selectedConversation: Conversation | undefined;
  onMarkAsUnread: (conversation: Conversation) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversation,
  onMarkAsUnread,
}) => {
  const [phoneNumbers, setPhoneNumbers] = React.useState<PhoneNumber[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    React.useState<PhoneNumber | null>(null);
  const [search, setSearch] = React.useState<string>("");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuConversation, setContextMenuConversation] = useState<
    Conversation | undefined
  >(undefined);
  const [filterByUnread, setFilterByUnread] = useState(false);
  const { currentProject } = useProjectContext();
  const { searchConversations, searchResults } = useConversationContext();

  useEffect(() => {
    const updatePhoneNumbers = () => {
      const uniquePhoneNumbers = new Set();

      conversations.forEach((conversation) => {
        if (conversation.phone_number) {
          uniquePhoneNumbers.add(conversation.phone_number.number);
        }
      });

      const newPhoneNumbers = [...uniquePhoneNumbers]
        .map(
          (number) =>
            conversations.find(
              (conversation) =>
                conversation.phone_number &&
                conversation.phone_number.number === number
            )?.phone_number
        )
        .filter(
          (phoneNumber): phoneNumber is NonNullable<typeof phoneNumber> =>
            phoneNumber !== null
        );

      setPhoneNumbers(newPhoneNumbers);
    };

    updatePhoneNumbers();
  }, [conversations, currentProject]);

  const debouncedSearchConversations = debounce((searchPattern: string) => {
    searchConversations(searchPattern);
  }, 1000);

  useEffect(() => {
    if (search === "") {
      return;
    }
    debouncedSearchConversations(search);
  }, [search]);

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

  if (!phoneNumbers || phoneNumbers.length === 0) {
    return <LoadingPage />;
  }

  console.log("conversations", conversations);
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
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </form>
        <Dropdown
          label={selectedPhoneNumber?.number || "All"}
          dismissOnClick={true}>
          <Dropdown.Item onClick={() => setSelectedPhoneNumber(null)}>
            All
          </Dropdown.Item>
          {phoneNumbers.length > 0 &&
            phoneNumbers[0] !== null &&
            phoneNumbers.map((phoneNumber, index) => (
              <Dropdown.Item
                key={index}
                onClick={() => setSelectedPhoneNumber(phoneNumber)}>
                {phoneNumber.name} ({phoneNumber.number})
              </Dropdown.Item>
            ))}
        </Dropdown>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800">
        <Checkbox
          id="filterByUnread"
          checked={filterByUnread}
          onChange={(e) => setFilterByUnread(e.target.checked)}
        />
        <Label htmlFor="filterByUnread">Filter by unread</Label>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-grow">
        {searchResults.length > 0
          ? searchResults
              .filter((result) => {
                if (filterByUnread && result.result_type === "conversation") {
                  return result.last_message.status !== "READ";
                }
                return true;
              })
              .map((result, index) => {
                if (result.result_type === "conversation") {
                  return (
                    <li
                      key={index}
                      className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${
                        selectedConversation &&
                        selectedConversation.id === result.conversation_id
                          ? "bg-gray-200 dark:bg-gray-700"
                          : ""
                      }`}
                      onClick={() =>
                        onSelectConversation(result.conversation_id)
                      }
                      onContextMenu={(e) => handleContextMenu(e, result)}>
                      <div className="flex justify-between 2xl:space-x-4 items-center">
                        <div className="flex space-x-4 xl:mb-4 2xl:mb-0 w-full items-center">
                          <div className="min-w-0 flex-1 w-fit">
                            <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white flex items-center gap-x-2">
                              {result.contact && result.contact.name}
                              <Badge color="primary">
                                {result.phone_number &&
                                  result.phone_number.number}
                              </Badge>
                            </p>
                            <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                              {result.contact && result.contact.wa_id}
                            </p>
                            {result.last_message && (
                              <>
                                <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                                  {result.last_message &&
                                    result.last_message.content}
                                </p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Last seen:{" "}
                                  {result.last_message.created_at &&
                                    new Date(
                                      result.last_message.created_at
                                    ).toLocaleString()}
                                </p>
                              </>
                            )}
                          </div>
                          {result.unread_messages > 0 && (
                            <Badge color="primary">
                              {result.unread_messages}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                } else if (result.result_type === "message") {
                  return (
                    <li
                      key={index}
                      className="p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600"
                      onClick={() =>
                        onSelectConversation(result.conversation_id)
                      }
                      onContextMenu={(e) => handleContextMenu(e, result)}>
                      <div className="flex justify-between 2xl:space-x-4 items-center">
                        <div className="flex space-x-4 xl:mb-4 2xl:mb-0 w-full items-center">
                          <div className="min-w-0 flex-1 w-fit">
                            <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white flex items-center gap-x-2">
                              {result.contact && result.contact.name}
                              <Badge color="primary">
                                {result.phone_number &&
                                  result.phone_number.number}
                              </Badge>
                            </p>
                            <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                              {result.matched_message &&
                                result.matched_message.content}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {result.message_created_at &&
                                new Date(
                                  result.message_created_at
                                ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                }
                return null;
              })
          : conversations
              .sort((a, b) => {
                if (
                  a.last_message === null ||
                  b.last_message === null ||
                  a.last_message === undefined ||
                  b.last_message === undefined
                ) {
                  return 0;
                }

                const aDate = a.last_message.created_at
                  ? new Date(a.last_message.created_at)
                  : new Date();
                const bDate = b.last_message.created_at
                  ? new Date(b.last_message.created_at)
                  : new Date();

                return bDate.getTime() - aDate.getTime();
              })
              .filter((conversation) => {
                if (conversation.last_message === null) {
                  return false;
                }

                if (
                  filterByUnread &&
                  conversation.last_message.status === "READ"
                ) {
                  return false;
                }

                if (selectedPhoneNumber !== null) {
                  return (
                    conversation.phone_number?.number ===
                    selectedPhoneNumber.number
                  );
                }

                const searchLower = search.toLowerCase();
                const contact = conversation.contact;

                const filterByUnreadCheck = filterByUnread
                  ? conversation.unread_messages > 0
                  : true;
                if (!filterByUnreadCheck) {
                  return false;
                }

                const nameMatch =
                  contact?.name?.toLowerCase().includes(searchLower) || false;
                const waIdMatch =
                  contact?.wa_id?.toLowerCase().includes(searchLower) || false;

                return nameMatch || waIdMatch;
              })
              .map((conversation, index) => (
                <li
                  key={index}
                  className={`p-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${
                    selectedConversation === conversation
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                  onContextMenu={(e) => handleContextMenu(e, conversation)}>
                  <div className="flex justify-between 2xl:space-x-4 items-center">
                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0 w-full items-center">
                      <div className="min-w-0 flex-1 w-fit">
                        <p className="mb-0.5 truncate text-base font-semibold leading-none text-gray-900 dark:text-white flex items-center gap-x-2">
                          {conversation.contact && conversation.contact.name}
                          <Badge color="primary">
                            {conversation.phone_number &&
                              conversation.phone_number.number}
                          </Badge>
                        </p>
                        <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                          {conversation.contact && conversation.contact.wa_id}
                        </p>
                        {conversation.last_message && (
                          <>
                            <p className="mb-1 truncate text-sm text-gray-500 dark:text-gray-400 font-normal">
                              {conversation.last_message &&
                                conversation.last_message.content}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Last seen:{" "}
                              {conversation.last_message.created_at &&
                                new Date(
                                  conversation.last_message.created_at
                                ).toLocaleString()}
                            </p>
                          </>
                        )}
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
