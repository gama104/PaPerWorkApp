import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import SignatureCanvas from "react-signature-canvas";

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
    const signaturePadRef = useRef<any>(null);

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

    const handleBegin = () => {
      console.log("Signature begin event triggered");
    };

    const handleEnd = () => {
      console.log("Signature end event triggered");
      if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        const signature = signaturePadRef.current.toDataURL();
        console.log("Signature captured:", signature.substring(0, 50) + "...");
        onSignatureChange(signature);
      } else {
        console.log("Signature pad is empty");
      }
    };

    // Initialize signature if provided and set up canvas
    useEffect(() => {
      if (signaturePadRef.current) {
        // Set canvas size explicitly
        const canvas = signaturePadRef.current.getCanvas();
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.offsetWidth;
          canvas.height = container.offsetHeight;
        }

        // Load initial signature if provided
        if (initialSignature) {
          signaturePadRef.current.fromDataURL(initialSignature);
        }
      }
    }, [initialSignature]);

    // Handle window resize to maintain signature canvas responsiveness
    useEffect(() => {
      const resizeCanvas = () => {
        if (signaturePadRef.current) {
          const canvas = signaturePadRef.current.getCanvas();
          const container = canvas.parentElement;
          if (container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
          }
        }
      };

      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    return (
      <div
        className={`w-full h-full ${className}`}
        style={{ minHeight: "200px" }}
      >
        <SignatureCanvas
          ref={signaturePadRef}
          onBegin={handleBegin}
          onEnd={handleEnd}
          canvasProps={{
            className:
              "w-full h-full border border-gray-300 dark:border-gray-600 rounded",
            style: {
              width: "100%",
              height: "100%",
              touchAction: "none", // Important for mobile touch events
            },
          }}
        />
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
