import React, { useState, useEffect } from "react";
import type { BackendTherapySession } from "../types/TherapyTypes";
import type { BaseFormProps } from "../types/ModalTypes";
import SignaturePadLegacy from "./SignaturePadLegacy";

interface TherapySessionFormContentProps extends BaseFormProps {
  certificationId: string;
  editSession?: BackendTherapySession | null;
  onSave: (session: BackendTherapySession) => void;
}

interface TherapySessionFormData {
  sessionDate: string;
  sessionTime: string;
  location: string;
  transportationRequired: boolean;
  parentSignatureStatus: string;
  notes: string;
  signatureImageData: string;
  signatureName: string;
  signatureNotes: string;
}

const TherapySessionFormContent: React.FC<TherapySessionFormContentProps> = ({
  certificationId,
  editSession,
  mode,
  onSave,
  onSuccess,
}) => {
  const [error, setError] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [formData, setFormData] = useState<TherapySessionFormData>({
    sessionDate: "",
    sessionTime: "",
    location: "",
    transportationRequired: false,
    parentSignatureStatus: "pending",
    notes: "",
    signatureImageData: "",
    signatureName: "",
    signatureNotes: "",
  });

  // Determine if we're in edit mode
  const isEditing = mode === "edit" || !!editSession;

  // Populate form when editing
  useEffect(() => {
    if (isEditing && editSession) {
      // Format the date properly for the HTML date input (yyyy-MM-dd)
      const formattedDate = editSession.sessionDate
        ? new Date(editSession.sessionDate).toISOString().split("T")[0]
        : "";

      setFormData({
        sessionDate: formattedDate,
        sessionTime: editSession.sessionTime || "",
        location: editSession.location || "",
        transportationRequired: editSession.transportationRequired || false,
        parentSignatureStatus: editSession.parentSignatureStatus || "pending",
        notes: editSession.notes || "",
        signatureImageData: editSession.signatureImageData || "",
        signatureName: editSession.signatureName || "",
        signatureNotes: editSession.signatureNotes || "",
      });
    }
  }, [isEditing, editSession]);

  const locations = ["Centro", "Virtual", "Escuela", "Home"];
  const signatureStatuses = ["pending", "completed", "not_required"];

  const handleInputChange = (
    field: keyof TherapySessionFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearSignature = () => {
    setFormData((prev) => ({
      ...prev,
      signatureImageData: "",
      signatureName: "",
      signatureNotes: "",
      parentSignatureStatus: "pending",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🎯 Form submitted!");
    setError("");

    // Validation
    if (!formData.sessionDate) {
      setError("Session date is required");
      return;
    }

    try {
      // Convert time string to TimeSpan format that backend can parse
      let sessionTime = undefined;
      if (formData.sessionTime) {
        const [hours, minutes] = formData.sessionTime.split(":");
        sessionTime = `${hours}:${minutes}:00`; // Format as "HH:MM:SS"
      }

      const sessionData = {
        id: editSession?.id || "", // Include ID if editing
        certificationDocumentId: certificationId,
        sessionDate: formData.sessionDate,
        sessionTime: sessionTime,
        location: formData.location,
        transportationRequired: formData.transportationRequired,
        parentSignatureStatus: formData.parentSignatureStatus,
        notes: formData.notes,
        signatureImageData: formData.signatureImageData,
        signatureName: formData.signatureName,
        signatureNotes: formData.signatureNotes,
        // Include required fields that BackendTherapySession expects
        createdAt: editSession?.createdAt || new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        therapistId: editSession?.therapistId || "",
      };

      console.log("📤 Calling onSave with data:", sessionData);
      // Call the parent's onSave function
      onSave(sessionData as BackendTherapySession);

      // Call the success callback for consistency with BaseFormProps
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error saving session:", err);
      setError(err instanceof Error ? err.message : "Failed to save session");
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form
        id="therapy-session-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Session Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Date *
              </label>
              <input
                type="date"
                value={formData.sessionDate}
                onChange={(e) =>
                  handleInputChange("sessionDate", e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Time
              </label>
              <input
                type="time"
                value={formData.sessionTime}
                onChange={(e) =>
                  handleInputChange("sessionTime", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="transportationRequired"
                checked={formData.transportationRequired}
                onChange={(e) =>
                  handleInputChange("transportationRequired", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="transportationRequired"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Transportation Required
              </label>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Signature
          </h3>

          <div className="space-y-4">
            {/* Existing Signature Display */}
            {formData.signatureImageData && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Current Signature
                  </h4>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Signature
                  </button>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-800 min-h-[120px] flex items-center justify-center">
                  <img
                    src={formData.signatureImageData}
                    alt="Signature"
                    className="max-w-full max-h-24 object-contain"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                      maxHeight: "96px",
                      objectFit: "contain",
                      objectPosition: "center",
                      transform: "scale(1.2)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Signature Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                {formData.signatureImageData
                  ? "Update Signature"
                  : "Add Signature"}
              </button>

              {!formData.signatureImageData && (
                <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                  No signature added yet
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Administrative Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Administrative Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Signature Status
              </label>
              <select
                value={formData.parentSignatureStatus}
                onChange={(e) =>
                  handleInputChange("parentSignatureStatus", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {signatureStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter session notes, observations, or recommendations..."
          />
        </div>
      </form>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add Signature
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

            <SignaturePadLegacy
              onSave={(signature: string) => {
                setFormData((prev) => ({
                  ...prev,
                  signatureImageData: signature,
                  signatureName: "Session Signature",
                  signatureNotes: "",
                  parentSignatureStatus: "completed",
                }));
                setShowSignatureModal(false);
              }}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessionFormContent;
