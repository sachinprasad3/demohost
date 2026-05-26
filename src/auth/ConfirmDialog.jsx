



import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel} className="relative z-50">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Centered Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {title || "Confirm Action"}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-gray-600">{message}</p>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onCancel}
              className="button lightbtn"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="button darkbtn"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
