// src/components/custom/CustomModal.tsx

import React from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  iconType?: "success" | "error" | "info";
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  actionLink,
  iconType = "info",
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (iconType) {
      case "success":
        return <FiCheckCircle className="text-green-500 w-8 h-8" />;
      case "error":
        return <FiAlertCircle className="text-red-500 w-8 h-8" />;
      case "info":
      default:
        return <FiInfo className="text-blue-500 w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <div className="flex flex-col items-center">
          {renderIcon()}
          <h2 className="text-xl font-semibold mt-4">{title}</h2>
          <p className="text-center mt-2">{message}</p>
          {actionText && actionLink && (
            <a
              href={actionLink}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              {actionText}
            </a>
          )}
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
