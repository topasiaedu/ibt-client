
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from "react";
import { useMessagesContext, MessageInsert, Conversation, Message } from "../../../context/MessagesContext";
import MessageComponent from "../../../components/MessageComponent";
import { IoAddOutline } from "react-icons/io5";
import { CiMicrophoneOn } from "react-icons/ci";
import { CiMicrophoneOff } from "react-icons/ci";
import { useAlertContext } from "../../../context/AlertContext";

interface ChatWindowProps {
  conversation: Conversation;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const [input, setInput] = React.useState("")
  const { addMessage } = useMessagesContext();
  const [file, setFile] = React.useState<File | null>(null)
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { showAlert } = useAlertContext();

  const handleSubmit = async () => {
    let mediaType = "text";

    // Check if its video | image | audio | document
    if (file) {
      const fileType = file.type.split("/")[0];
      mediaType = fileType === "image" ? "image" : fileType === "video" ? "video" : "document";
    } else if (audioFile) {
      mediaType = "audio";
    }

    // Add message to conversation
    const data: MessageInsert = {
      contact_id: conversation.contact.contact_id,
      direction: "outbound",
      content: input,
      created_at: new Date().toISOString(),
      message_type: mediaType,
      phone_number_id: conversation.phone_number.phone_number_id,
      status: "delivered",
      wa_message_id: null,
    };

    if (file) {
      addMessage(data, file)
    } else if (audioFile) {
      addMessage(data, audioFile)
    } else {
      addMessage(data)
    }

    // Clear input field
    setInput("");
    setFile(null);
    setAudioFile(null);
  };

  useEffect(() => {
    // Scroll to the bottom of the chat window
    const chatWindow = document.querySelector(".scrollToBottom");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [conversation.messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
  useEffect(() => {
    // Create a URL whenever there's a new audio file
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);

      // Cleanup the URL when it's no longer needed
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);  // Dependency array ensures this runs only if audioFile changes

  const startRecording = async () => {
    // Clear any previous data
    audioChunks.current = [];
    setAudioFile(null);


    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        setRecording(true);

        mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
          setAudioFile(new File([audioBlob], 'recording.mp3', { type: 'audio/mpeg' }));
          audioChunks.current = [];
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    } else {
      console.error("getUserMedia not supported on this browser");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="col-span-2 m-auto mb-5 h-full space-y-6 overflow-hidden overflow-y-auto p-4 lg:pt-6 w-full flex flex-col">
      {/* Chat Messages */}
      {/* Scroll to the bottom of the chat window */}
      <div className="flex flex-grow gap-4 xl:h-[calc(100vh-15rem)] overflow-y-auto scrollToBottom flex-col">
        {[...conversation.messages].reverse().map((message, index) => (
          <div key={conversation.id + '' + index}>
            {generateMessage(message)}
          </div>
        ))}
      </div>
      {/* Chatroom Input */}
      <label htmlFor="chat" className="sr-only">Your message</label>
      {file && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{file.name}</span>
          </div>
          <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={() => setFile(null)}>
            <svg className="w-5 h-5 rtl:rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm4.293 5.293a1 1 0 0 1 1.414 1.414L11.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L8.586 10 5.293 6.707a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293z" />
            </svg>
            <span className="sr-only">Remove attachment</span>
          </button>
        </div>
      )}

      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
        <label className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
          <IoAddOutline className="w-5 h-5" />
          <span className="sr-only">Upload File</span>
          <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <button type="button" className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
          {recording ? <CiMicrophoneOff className="w-5 h-5" onClick={stopRecording} /> : <CiMicrophoneOn className="w-5 h-5" onClick={startRecording} />}
          <span className="sr-only">Record Audio</span>
        </button>

        {recording && (
          <button type="button" className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={stopRecording}>
            <span className="sr-only">Stop Recording</span>
          </button>
        )}

        {recording && (<span className="text-sm text-gray-500">Recording...</span>)}

        {audioUrl && (
          <div className="flex items-center space-x-2">
            <audio src={audioUrl} controls className="w-40 h-10" />
            <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={() => setAudioFile(null)}>
              <svg className="w-5 h-5 rtl:rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 1a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm4.293 5.293a1 1 0 0 1 1.414 1.414L11.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L8.586 10 5.293 6.707a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293z" />
              </svg>
              <span className="sr-only">Remove attachment</span>
            </button>
          </div>
        )}

        {!recording && !audioFile && (
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


        <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600" onClick={handleSubmit}>
          <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
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
  if (message_type === "TEMPLATE") {
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
    case "sticker":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="IMAGE" />;
    case "video":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="VIDEO" />;
    case "audio":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="AUDIO" />;
    case "document":
      return <MessageComponent message={message.content || ""} media={message.media_url || ""} direction={message.direction as 'inbound' | 'outbound' || ""} date={newDate} status={message.status || ""} headerType="DOCUMENT" />;
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