// src/components/Popup.jsx
import React from 'react';

function Popup({ title, content, onClose}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="text-sm text-gray-700">{content}</div>
      </div>
    </div>
  );
}

export default Popup;
