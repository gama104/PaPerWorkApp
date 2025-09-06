import React, { useEffect, useState, useRef } from "react";
import type { SessionFormData, BaseFormProps } from "../../../shared/types/ModalTypes";
import { useForm } from "../../../shared/hooks/useForm";
import SignaturePad, { type SignaturePadRef } from "../../../components/SignaturePad";

interface SessionFormProps extends BaseFormProps<SessionFormData> {
  mode: "create" | "edit";
  certificationDocumentId: string;
}

const LOCATIONS = ["Centro", "Home", "School", "Clinic", "Other"];

const SIGNATURE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

export const SessionForm: React.FC<SessionFormProps> = ({
  data: initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  mode,
  certificationDocumentId,
}) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isSignatureValid, setIsSignatureValid] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [originalSignature, setOriginalSignature] = useState<string>("");

  const {
    data: formData,
    errors,
    isSubmitting,
    updateField,
    setFormData,
    submit,
  } = useForm<SessionFormData>({
    certificationDocumentId,
    sessionDate: "",
    sessionTime: "",
    location: "",
    transportationRequired: false,
    parentSignatureStatus: "pending",
    signatureImageData: "",
    notes: "",
  });

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.signatureImageData) {
        setSignatureData(initialData.signatureImageData);
        setOriginalSignature(initialData.signatureImageData); // Store original signature
        setIsSignatureValid(true);
        setShowSignaturePad(false);
      } else {
        setOriginalSignature(""); // No original signature
        setShowSignaturePad(true);
      }
    } else {
      // Set default values for new sessions
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().slice(0, 5);
      const defaultData = {
        certificationDocumentId,
        sessionDate: today,
        sessionTime: now,
        location: "",
        transportationRequired: false,
        parentSignatureStatus: "pending" as const,
        signatureImageData: "",
        notes: "",
      };
      setFormData(defaultData);
      setOriginalSignature(""); // No original signature for new sessions
      setShowSignaturePad(true);
    }
  }, [initialData, certificationDocumentId]);

  // Initialize signature pad when it becomes visible
  useEffect(() => {
    if (showSignaturePad && signaturePadRef.current && signatureData) {
      // Small delay to ensure the signature pad is fully mounted
      setTimeout(() => {
        if (signaturePadRef.current) {
          signaturePadRef.current.setSignatureData(signatureData);
        }
      }, 100);
    }
  }, [showSignaturePad, signatureData]);

  // Handle signature changes
  const handleSignatureChange = (signature: string) => {
    setSignatureData(signature);
    setIsSignatureValid(signature.length > 0);
    updateField("signatureImageData", signature);

    // Auto-update signature status if signature is provided
    if (signature.length > 0) {
      updateField("parentSignatureStatus", "completed");
    } else {
      updateField("parentSignatureStatus", "pending");
    }
  };

  const handleAcceptSignature = () => {
    console.log("🔄 Accepting signature - applying to form and hiding pad");
    if (signaturePadRef.current) {
      const signature = signaturePadRef.current.getSignatureData();
      if (signature) {
        handleSignatureChange(signature);
      }
    }
    setShowSignaturePad(false); // Hide the signature pad after accepting
  };

  const handleClearSignature = () => {
    console.log("🔄 Clearing signature");
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignatureData("");
    setIsSignatureValid(false);
    updateField("signatureImageData", "");
    updateField("parentSignatureStatus", "pending");
  };

  const handleCancelSignature = () => {
    console.log("🔄 Cancelling signature - restoring original signature");
    // Restore the original signature in the signature pad
    if (signaturePadRef.current) {
      signaturePadRef.current.setSignatureData(originalSignature);
    }

    // Restore the original signature in form state
    setSignatureData(originalSignature);
    setIsSignatureValid(originalSignature.length > 0);
    updateField("signatureImageData", originalSignature);

    // Update signature status based on original signature
    if (originalSignature.length > 0) {
      updateField("parentSignatureStatus", "completed");
    } else {
      updateField("parentSignatureStatus", "pending");
    }

    setShowSignaturePad(false); // Hide the signature pad
  };

  // Validation rules
  const validationRules = {
    certificationDocumentId: (value: string) =>
      !value ? "Certification document ID is required" : null,
    sessionDate: (value: string) =>
      !value ? "Please select a session date" : null,
    sessionTime: (value: string) =>
      !value ? "Please select a session time" : null,
    location: (value: string) => (!value ? "Please select a location" : null),
    transportationRequired: (_value: boolean) => null, // No validation needed
    parentSignatureStatus: (_value: string) => null, // No validation needed
    signatureImageData: (_value: string) => null, // No validation needed
    notes: (_value: string) => null, // No validation needed
  };

  // Convert form data back to backend format
  const transformDataForBackend = (formData: SessionFormData) => {
    // Add seconds to time format for backend (e.g., "16:30" -> "16:30:00")
    const formatTimeForBackend = (time: string) => {
      return `${time}:00`;
    };

    return {
      ...formData,
      sessionTime: formatTimeForBackend(formData.sessionTime),
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log(
      "🔄 SessionForm - Current form data before transformation:",
      formData
    );
    const success = await submit(async (data) => {
      const transformedData = transformDataForBackend(data);
      console.log(
        "🔄 SessionForm - Transformed data for backend:",
        transformedData
      );
      await onSubmit(transformedData);
    }, validationRules);

    if (success) {
      console.log("✅ Session form submitted successfully");
    }
  };

  return (
    <form
      id="session-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6 p-6"
    >
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Date *
          </label>
          <input
            type="date"
            value={formData.sessionDate}
            onChange={(e) => updateField("sessionDate", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.sessionDate
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.sessionDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.sessionDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Time *
          </label>
          <input
            type="time"
            value={formData.sessionTime}
            onChange={(e) => updateField("sessionTime", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.sessionTime
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.sessionTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.sessionTime}
            </p>
          )}
        </div>
      </div>

      {/* Location and Transportation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location *
          </label>
          <select
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.location
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Select location</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.location}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="transportationRequired"
            checked={formData.transportationRequired}
            onChange={(e) =>
              updateField("transportationRequired", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label
            htmlFor="transportationRequired"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Transportation Required
          </label>
        </div>
      </div>

      {/* Signature Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Parent Signature
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signature *
            </label>

            {(() => {
              console.log("🔄 Signature render state:", {
                showSignaturePad,
                hasSignatureData: !!signatureData,
                signatureDataLength: signatureData?.length || 0,
              });
              return null;
            })()}

            {!showSignaturePad && signatureData ? (
              // Show existing signature with update button
              <div className="space-y-3">
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-800">
                  <img
                    src={signatureData}
                    alt="Current signature"
                    className="max-w-full h-auto max-h-32 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "🔄 Update Signature clicked - setting showSignaturePad to true"
                    );
                    setShowSignaturePad(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update Signature
                </button>
              </div>
            ) : showSignaturePad ? (
              // Show signature pad only when showSignaturePad is true
              <div className="space-y-3">
                <SignaturePad
                  ref={signaturePadRef}
                  onSignatureChange={handleSignatureChange}
                  initialSignature={signatureData}
                  className="w-full"
                />

                {/* Custom action buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSignature}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptSignature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    Accept
                  </button>
                </div>

                {!isSignatureValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Please provide a signature
                  </p>
                )}
              </div>
            ) : (
              // Show signature pad for new sessions (no existing signature)
              <div className="space-y-3">
                <SignaturePad
                  ref={signaturePadRef}
                  onSignatureChange={handleSignatureChange}
                  initialSignature=""
                  className="w-full"
                />

                {/* Custom action buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSignature}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptSignature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    Accept
                  </button>
                </div>

                {!isSignatureValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Please provide a signature
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Signature Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signature Status
            </label>
            <select
              value={formData.parentSignatureStatus}
              onChange={(e) =>
                updateField(
                  "parentSignatureStatus",
                  e.target.value as "pending" | "completed"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {SIGNATURE_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Session Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Notes
        </label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Enter notes about the therapy session..."
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.submit}
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
