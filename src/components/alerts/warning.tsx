
import React from 'react';
import type { AlertProps } from '../../types/alertTypes';

const WarningAlert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
      {message}
    </div>
  );
}

export default WarningAlert;