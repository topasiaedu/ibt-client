import React from 'react';
import { FiAlertCircle } from "react-icons/fi";
import { Json } from '../../database.types';

interface MessageComponentProps {
  header?: string;
  message?: string;
  media?: string;
  footer?: string;
  date?: string;
  direction?: 'inbound' | 'outbound';
  status?: string;
  buttons?: (string | null)[]
  headerType?: 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'DOCUMENT';
  error?: Json;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ header, message, media, footer, date, direction, status, buttons, headerType, error }) => {
  const isInbound = direction === 'inbound';

  return (
    <div className={`flex items-start gap-2.5 ${isInbound ? "" : "flex-row-reverse"} max-w-full break-all`}>
      <div className={`flex flex-col gap-1 w-full max-w-[320px] ${isInbound ? "" : "items-end"}`}>
        {date && <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{date}</span>}
        <div className={`flex flex-col leading-1.5 p-2 border-gray-200 rounded-bl-xl rounded-br-xl ${isInbound ? "bg-gray-100 dark:bg-gray-700 rounded-tr-xl" : "bg-green-100 dark:bg-green-700 rounded-tl-xl"}`} style={{ width: 'fit-content' }}>
          {header && <span className="text-sm font-semibold text-gray-900 dark:text-white">{header}</span>}
          {media && headerType === "IMAGE" && <img src={media} alt="media" className="w-full h-40 object-cover rounded-xl" />}
          {media && headerType === "VIDEO" && <video src={media} controls className="w-full h-40 object-cover rounded-xl" />}
          {media && headerType === "AUDIO" && <audio src={media} controls />}
          {media && headerType === "DOCUMENT" && <a href={media} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-500">{media}</a>}

          {message && (
            <span className="text-sm font-normal text-gray-900 dark:text-white" style={{ whiteSpace: 'pre-wrap' }}>
              {message}
            </span>
          )}
          {footer && <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-2">{footer}</span>}
          {buttons && (
            <div className="mt-2">
              {buttons.map((button, index) => (
                <button key={index} className="px-2 w-full py-1 text-xs font-semibold text-blue-500 bg-white rounded-md mt-1">{button}</button>
              ))}
            </div>
          )}
        </div>
        {!isInbound &&!error && status && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{status.toLowerCase()}</span>}
        {error && (
          <div className="flex items-center gap-2 mt-1">
            <FiAlertCircle className="text-red-500" />
            <span className="text-xs font-normal text-red-500">{(error as any).error_data.details}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;