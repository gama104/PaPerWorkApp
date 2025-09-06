import React from "react";

interface SignatureDisplayProps {
  signature: {
    signatureImageData: string;
    signedBy: string;
    signedAt: string;
    signatureNotes?: string;
  };
  showDetails?: boolean;
  className?: string;
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  showDetails = true,
  className = "",
}) => {
  if (!signature?.signatureImageData) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        No signature available
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Signature Image */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
        <img
          src={signature.signatureImageData}
          alt={`Signature by ${signature.signedBy}`}
          className="max-w-full h-auto max-h-24 object-contain"
        />
      </div>

      {/* Signature Details */}
      {showDetails && (
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            <span className="font-medium">Signed by:</span> {signature.signedBy}
          </div>
          <div>
            <span className="font-medium">Date:</span>{" "}
            {new Date(signature.signedAt).toLocaleDateString()}
          </div>
          {signature.signatureNotes && (
            <div>
              <span className="font-medium">Notes:</span>{" "}
              {signature.signatureNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureDisplay;
