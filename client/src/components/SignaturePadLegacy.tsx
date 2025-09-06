import React, { useRef } from "react";
import SignaturePad, { type SignaturePadRef } from "./SignaturePad";

/**
 * Legacy wrapper for SignaturePad to maintain backward compatibility
 * This component provides the old interface (onSave, onCancel) for existing components
 * while using the new pure SignaturePad component internally
 */
interface SignaturePadLegacyProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;
  className?: string;
}

const SignaturePadLegacy: React.FC<SignaturePadLegacyProps> = ({
  onSave,
  onCancel,
  className = "",
}) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSignatureChange = (signature: string) => {
    // Auto-save when signature changes (legacy behavior)
    if (signature) {
      onSave(signature);
    }
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleAccept = () => {
    if (signaturePadRef.current) {
      const signature = signaturePadRef.current.getSignatureData();
      if (signature) {
        onSave(signature);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}
    >
      {/* Signature canvas container */}
      <div className="relative bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4">
        <SignaturePad
          ref={signaturePadRef}
          onSignatureChange={handleSignatureChange}
          className="w-full"
        />
      </div>

      {/* Action buttons - maintaining legacy interface */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default SignaturePadLegacy;
