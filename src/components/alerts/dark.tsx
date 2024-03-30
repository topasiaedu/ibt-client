
import React from 'react';
import type { AlertProps } from '../../types/alertTypes';

const DarkAlert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300" role="alert">
      {message}
    </div>
  );
}

export default DarkAlert;