

import React from 'react';

interface ClientToastProps {
  message: string;
  onClose: () => void; // Add this prop
  // Add other props if necessary
}

const ClientToast: React.FC<ClientToastProps> = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg flex items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">
        ×
      </button>
    </div>
  );
};

export default ClientToast;
