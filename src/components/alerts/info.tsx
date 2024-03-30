
import React from 'react';
import type { AlertProps } from '../../types/alertTypes';

const InfoAlert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
      {message}
    </div>
  );
}

export default InfoAlert;