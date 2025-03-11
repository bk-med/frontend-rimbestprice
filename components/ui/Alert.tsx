import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FiXCircle className="h-5 w-5" />;
      case 'success':
        return <FiCheckCircle className="h-5 w-5" />;
      case 'warning':
        return <FiAlertCircle className="h-5 w-5" />;
      case 'info':
        return <FiInfo className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert; 