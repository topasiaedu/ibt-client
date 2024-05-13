
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from "react";
import { useMessagesContext, MessageInsert, Conversation, Message } from "../../../context/MessagesContext";
import MessageComponent from "../../../components/MessageComponent";

interface ChatWindowProps {
  conversation: Conversation;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const [input, setInput] = React.useState("")
  const waba_id = conversation.whatsapp_business_account.waba_id;
  const to = conversation.contact.wa_id;
  const { addMessage } = useMessagesContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    // Add message to conversation
    const data: MessageInsert = {
      contact_id: conversation.contact.contact_id,
      direction: "outbound",
      content: input,
      created_at: new Date().toISOString(),
      message_type: "text",
      phone_number_id: conversation.phone_number.phone_number_id,
      status: "delivered",
      wa_message_id: null,
    };


    addMessage(data)

    // Clear input field
    setInput("");
  }



  useEffect(() => {
    // Scroll to the bottom of the chat window
    const chatWindow = document.querySelector(".scrollToBottom");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [conversation.messages]);


  return (
    <div className="col-span-2 m-auto mb-5 h-full space-y-6 overflow-hidden overflow-y-auto p-4 lg:pt-6 w-full">
      {/* Chat Messages */}
      {/* Scroll to the bottom of the chat window */}
      <div className="flex flex-col gap-4 xl:h-[calc(100vh-15rem)] overflow-y-auto scrollToBottom">
        {[...conversation.messages].reverse().map((message, index) => (
          <div key={conversation.id + '' + index}>
            {generateMessage(message)}
          </div>
        ))}
      </div>
      {/* Chatroom Input */}
      <form onSubmit={handleSubmit} >
        <label htmlFor="chat" className="sr-only">Your message</label>
        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          {/* <button type="button" className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                <path fill="currentColor" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 1H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z" />
              </svg>
              <span className="sr-only">Upload image</span>
            </button>
            <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z" />
              </svg>
              <span className="sr-only">Add emoji</span>
            </button> */}
          <textarea id="chat" rows={1} className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your message..."
            value={input} onChange={(e) => setInput(e.target.value)}></textarea>

          <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
            <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
              <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
            </svg>
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const generateMessage = (message: Message) => {
  const newDate = new Date(message.created_at || "").toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  })
  const { message_type } = message;
  if ( message_type === "TEMPLATE") {
    // Check if it has video or image
    if (message.media_url) {
      if (message.media_url.includes("mp4")) {
        return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="VIDEO" />;
      } else {
        return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="IMAGE" />;
      }
    } else {
      return <MessageComponent message={message.content || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} />;
    }
  }

  switch (message_type) {
    case "text":
      return <MessageComponent message={message.content || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} />;
    case "image":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="IMAGE" />;
    case "video":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="VIDEO" />;
    // case "voice":
    //   return <VoiceMessage />;
    // case "file":
    //   return <FileMessage />;
    // case "multiple_images":
    //   return <MultipleImagesMessage />;
    default:
      return null;
  }
}
export default ChatWindow;