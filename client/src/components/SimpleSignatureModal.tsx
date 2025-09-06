import React, { useState, useRef } from "react";
import SignaturePad, { type SignaturePadRef } from "./SignaturePad";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (signatureData: string) => void;
  title?: string;
  initialSignature?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = "Sign Session",
  initialSignature = "",
}) => {
  const [signatureData, setSignatureData] = useState<string>(initialSignature);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSignatureChange = (signature: string) => {
    setSignatureData(signature);
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignatureData("");
    }
  };

  const handleCancel = () => {
    // Reset to initial signature if it existed
    setSignatureData(initialSignature);
    onClose();
  };

  const handleAccept = () => {
    if (!signatureData.trim()) {
      alert("Please provide a signature");
      return;
    }
    onAccept(signatureData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Signature Area */}
        <div className="flex-1 p-6 min-h-0">
          <div className="h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <SignaturePad
              ref={signaturePadRef}
              onSignatureChange={handleSignatureChange}
              initialSignature={initialSignature}
              className="w-full h-full min-h-[300px] md:min-h-[400px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Clear
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!signatureData.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
