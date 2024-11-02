// src/components/PromoPopup.tsx

'use client';

import { useState, useEffect } from 'react';

export default function PromoPopup() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsPopupOpen(true), 5000); // Open popup after 5 seconds
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);

  return (
    <div>
      {/* <button
        onClick={openPopup}
        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
      >
        Open Promo Popup
      </button> */}

    {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
          <div className="relative bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            {/* Close "X" button at the corner */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-2">Unlock a €50</h2>
            <p className="mb-4">gift card with your first global transfer</p>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
              Receive my promo code →
            </button>
            <button
              className="block mt-4 text-blue-600 underline text-sm"
              onClick={closePopup}
            >
              No thanks, just let me look around
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
