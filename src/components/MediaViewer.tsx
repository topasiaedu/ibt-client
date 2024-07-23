import React, { useState } from 'react';
import ModalImage from 'react-modal-image';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    type: string;
    src: string;
  };
}

const MediaViewer: React.FC<MediaViewerProps> = ({ isOpen, onClose, media }) => {
  if (!isOpen) return null;

  return (
    <>
      {media.type === 'image' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl w-full dark:bg-gray-800">
            <div className="p-4 border-b flex justify-between items-center dark:border-gray-700">
              <h2 className="text-lg font-semibold">Media Viewer</h2>
              <button
                onClick={onClose}
                className="text-black hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <ModalImage
                small={media.src}
                large={media.src}
                alt="Media"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl w-full dark:bg-gray-800">
            <div className="p-4 border-b flex justify-between items-center dark:border-gray-700">
              <h2 className="text-lg font-semibold">Media Viewer</h2>
              <button
                onClick={onClose}
                className="text-black hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {media.type === 'video' && (
                <video
                  src={media.src}
                  controls
                  className="w-full h-96"
                />
              )}
              {media.type === 'audio' && (
                <audio
                  src={media.src}
                  controls
                  className="w-full"
                />
              )}
              {media.type === 'document' && (
                <iframe
                  src={media.src}
                  title="Document Viewer"
                  className="w-full h-96"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaViewer;
