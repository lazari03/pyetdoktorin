import React from 'react';
import { z } from '@/config/zIndex';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${z.modal}`}>
      <div className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative ${z.modalContent}`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
