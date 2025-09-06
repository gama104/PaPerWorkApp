import React, { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas, { type SignaturePadRef } from "./SignatureCanvas";

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  initialSignature?: string;
  className?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  getSignatureData: () => string;
  setSignatureData: (data: string) => void;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange, initialSignature, className = "" }, ref) => {
    const signaturePadRef = useRef<SignaturePadRef>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      clear: () => {
        if (signaturePadRef.current) {
          signaturePadRef.current.clear();
          onSignatureChange("");
        }
      },
      isEmpty: () => {
        return signaturePadRef.current
          ? signaturePadRef.current.isEmpty()
          : true;
      },
      getSignatureData: () => {
        return signaturePadRef.current && !signaturePadRef.current.isEmpty()
          ? signaturePadRef.current.getSignatureData()
          : "";
      },
      setSignatureData: (data: string) => {
        if (signaturePadRef.current) {
          if (data) {
            signaturePadRef.current.setSignatureData(data);
          } else {
            signaturePadRef.current.clear();
          }
        }
      },
    }));

    const handleSignatureChange = (signature: string) => {
      onSignatureChange(signature);
    };

    return (
      <div className={`w-full h-full ${className}`}>
        <SignatureCanvas
          ref={signaturePadRef}
          onSignatureChange={handleSignatureChange}
          initialSignature={initialSignature}
          className="w-full h-full"
        />
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
