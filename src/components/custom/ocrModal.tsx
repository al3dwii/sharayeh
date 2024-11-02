import React from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText: string;
  actionLink?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  actionLink,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.0 }}
    >
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex flex-col items-center">
          {actionLink ? (
            <a
              href={actionLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4"
            >
              {actionText}
            </a>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg mb-4"
            >
              {actionText}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Modal;

