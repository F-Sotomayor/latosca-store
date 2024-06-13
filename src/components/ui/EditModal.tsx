import React from "react";
import {X} from "lucide-react"; // Import the close icon

function Modal({isOpen, onClose, title, children}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-11/12 max-w-md rounded-lg bg-brand-50 p-6 shadow-lg">
        <button className="absolute right-2 top-2" type="submit" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
        <div className="mb-4 text-xl font-semibold text-black">{title}</div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
