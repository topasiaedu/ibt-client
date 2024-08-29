/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import {
  useMessagesContext,
  MessageInsert,
  Message,
} from "../../../context/MessagesContext";
import MessageComponent from "../../../components/MessageComponent";
import { IoAddOutline } from "react-icons/io5";
// import { useAlertContext } from "../../../context/AlertContext";
import Picker from "emoji-picker-react";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { Conversation } from "../../../context/ConversationContext";
import LoadingPage from "../../pages/loading";
import VoiceRecorder from "../../../components/VoiceRecorder";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages }) => {
  const [input, setInput] = React.useState("");
  const { addMessage } = useMessagesContext();
  const [file, setFile] = React.useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [contextMessage, setContextMessage] = useState<Message | null>(null);
  const [ableToSend, setAbleToSend] = useState(true);

  const handleSubmit = async () => {
    let mediaType = "text";

    // Check if its video | image | audio | document
    if (file) {
      const fileType = file.type.split("/")[0];
      mediaType =
        fileType === "image"
          ? "image"
          : fileType === "video"
          ? "video"
          : "document";
    } else if (audioFile) {
      mediaType = "audio";
    }

    // Add message to conversation
    const data: MessageInsert = {
      contact_id: conversation.contact_id,
      direction: "outbound",
      content: input,
      created_at: new Date().toISOString(),
      message_type: mediaType,
      phone_number_id: conversation.phone_number.phone_number_id,
      status: "delivered",
      wa_message_id: null,
      context: contextMessage?.message_id || null,
      project_id: conversation.project_id,
    };

    const fileToSend = file || audioFile;

    if (fileToSend && contextMessage) {
      addMessage(
        data,
        conversation.id,
        conversation.contact.wa_id,
        fileToSend,
        contextMessage
      );
    } else if (fileToSend) {
      addMessage(data, conversation.id, conversation.contact.wa_id, fileToSend);
    } else if (contextMessage) {
      addMessage(
        data,
        conversation.id,
        conversation.contact.wa_id,
        undefined,
        contextMessage
      );
    } else {
      addMessage(data, conversation.id, conversation.contact.wa_id);
    }

    // Clear input field
    setInput("");
    setFile(null);
    setAudioFile(null);
    setContextMessage(null);
    setOpenEmoji(false);
  };

  useEffect(() => {
    // Check within the last 24 hours, is there any inbound message or message.message_type === "TEMPLATE"
    function isWithinLast24Hours(dateString: string | null) {
      const date = new Date(dateString || "");
      const diffInHours =
        (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
      return diffInHours < 24;
    }

    const lastMessage = messages.find(
      (message) =>
        (message.direction === "inbound" &&
          message.message_type !== "TEMPLATE") ||
        message.message_type === "TEMPLATE"
    );

    if (lastMessage && isWithinLast24Hours(lastMessage.created_at)) {
      setAbleToSend(true);
    } else {
      setAbleToSend(true); // Always true in this scenario
    }

    // Scroll to the bottom of the chat window
    scrollToBottom();
  }, [messages, messages.length]);

  const scrollToBottom = () => {
    const chatWindow = document.querySelector(".scrollToBottom");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onEmojiClick = (emojiObject: any, e: any) => {
    setInput(input + emojiObject.emoji);
  };

  if (!messages || !conversation) {
    return <LoadingPage />;
  }

  const onDoubleClick = (message: Message) => {
    // Set the context message
    setContextMessage(message);
    scrollToBottom();
  };

  const onContextClick = (message: Message) => {
    //Scroll to the message
    const messageElement = document.getElementById(
      message.message_id.toString() || ""
    );
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!ableToSend) {
    return (
      <div className="col-span-2 m-auto mb-5 h-full space-y-6 overflow-hidden overflow-y-auto p-4 lg:pt-6 w-full flex flex-col relative">
        {/* Chat Messages */}
        {/* Scroll to the bottom of the chat window */}
        <div className="flex flex-grow gap-4 xl:h-[calc(100vh-15rem)] overflow-y-auto scrollToBottom flex-col">
          {[...messages].reverse().map((message, index) => (
            <div key={message.message_id} id={message.message_id.toString()}>
              {generateMessage(message, onDoubleClick, onContextClick)}
            </div>
          ))}
        </div>
        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-gray-500">
            You can only send a message after 24 hours of the last inbound
            message or template message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 m-auto mb-5 h-full space-y-6 overflow-hidden overflow-y-auto p-4 lg:pt-6 w-full flex flex-col relative">
      {/* Chat Messages */}
      {/* Scroll to the bottom of the chat window */}
      <div className="flex flex-grow gap-4 xl:h-[calc(100vh-15rem)] overflow-y-auto scrollToBottom flex-col">
        {[...messages].reverse().map((message, index) => (
          <div key={message.message_id} id={message.message_id.toString()}>
            {generateMessage(message, onDoubleClick, onContextClick)}
          </div>
        ))}
      </div>
      {/* Chatroom Input */}
      <label htmlFor="chat" className="sr-only">
        Your message
      </label>

      {contextMessage && (
        <div
          className="flex mb-2 p-1 items-center gap-2 border-l-4 border-gray-300 bg-gray-200 p-1 rounded-lg dark:bg-gray-700 dark:border-gray-600 z-10"
          onClick={() => onContextClick && onContextClick(contextMessage)}>
          {/* show context.content with max 3 lines */}
          <span className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-3">
            {contextMessage.content}
          </span>
        </div>
      )}

      {file && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{file.name}</span>
          </div>
          <button
            type="button"
            className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
            onClick={() => setFile(null)}>
            <svg
              className="w-5 h-5 rtl:rotate-90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 1a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm4.293 5.293a1 1 0 0 1 1.414 1.414L11.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L8.586 10 5.293 6.707a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293z"
              />
            </svg>
            <span className="sr-only">Remove attachment</span>
          </button>
        </div>
      )}

      {openEmoji && (
        <div
          className={`absolute bottom-24 left-45 z-10 ${
            openEmoji ? "" : "hidden"
          }`}>
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
        <label className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
          <IoAddOutline className="w-5 h-5" />
          <span className="sr-only">Upload File</span>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>{" "}
        <button
          type="button"
          className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
          onClick={() => setOpenEmoji(!openEmoji)}>
          <MdOutlineEmojiEmotions className="w-5 h-5" />
          <span className="sr-only">Open Emoji</span>
        </button>
        {/* <VoiceRecorder setFile={setAudioFile}/> */}
        {!audioFile && (
          <textarea
            id="chat"
            rows={1}
            className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        )}
        <button
          type="submit"
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
          onClick={handleSubmit}>
          <svg
            className="w-5 h-5 rotate-90 rtl:-rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 20">
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </div>
  );
};
const generateMessage = (
  message: Message,
  onDoubleClick: (message: Message) => void,
  onContextClick: (message: Message) => void
) => {
  const newDate = new Date(message.created_at || "").toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }
  );

  const {
    message_type,
    media_url,
    content,
    direction,
    status,
    error,
    context_message,
  } = message;

  const renderMessageComponent = (headerType?: string) => (
    <MessageComponent
      message={content || ""}
      media={media_url || ""}
      direction={(direction as "inbound" | "outbound") || ""}
      date={newDate}
      status={status || ""}
      headerType={headerType as "VIDEO" | "IMAGE" | "DOCUMENT" | "AUDIO"}
      error={error || ""}
      context={context_message}
      onDoubleClick={onDoubleClick}
      onContextClick={onContextClick}
      messageObj={message}
    />
  );

  if (message_type === "TEMPLATE") {
    if (media_url) {
      if (media_url.includes("mp4")) {
        return renderMessageComponent("VIDEO");
      } else {
        return renderMessageComponent("IMAGE");
      }
    } else {
      return renderMessageComponent();
    }
  }

  switch (message_type) {
    case "text":
      return renderMessageComponent();
    case "button":
      return renderMessageComponent();
    case "image":
      return renderMessageComponent("IMAGE");
    case "sticker":
      return renderMessageComponent("IMAGE");
    case "video":
      return renderMessageComponent("VIDEO");
    case "audio":
      return renderMessageComponent("AUDIO");
    case "document":
      return renderMessageComponent("DOCUMENT");
    default:
      return null;
  }
};

export default ChatWindow;
