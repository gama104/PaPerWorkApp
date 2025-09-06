import React, { useState, useEffect } from "react";
import type { BackendTherapySession } from "../types/TherapyTypes";
import { sessionService } from "../features/sessions/services/sessionService";
import SignaturePadLegacy from "./SignaturePadLegacy";

interface TherapySessionFormProps {
  certificationId: string;
  editSession?: BackendTherapySession | null;
  onSessionCreated?: (session: BackendTherapySession) => void;
  onSessionUpdated?: (session: BackendTherapySession) => void;
  onClose: () => void;
}

interface TherapySessionFormData {
  sessionDate: string;
  sessionTime: string;
  location: string;
  durationMinutes: string;
  transportationRequired: boolean;
  parentSignatureStatus: string;
  certifyingOfficialName: string;
  notes: string;
  signatureData: string;
  signatureName: string;
  signatureNotes: string;
}

const TherapySessionForm: React.FC<TherapySessionFormProps> = ({
  certificationId,
  editSession,
  onSessionCreated,
  onSessionUpdated,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [formData, setFormData] = useState<TherapySessionFormData>({
    sessionDate: "",
    sessionTime: "",
    location: "",
    transportationRequired: false,
    parentSignatureStatus: "pending",
    notes: "",
    signatureData: "",
    signatureName: "",
    signatureNotes: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (editSession) {
      // Format the date properly for the HTML date input (yyyy-MM-dd)
      const formattedDate = editSession.sessionDate
        ? new Date(editSession.sessionDate).toISOString().split("T")[0]
        : "";

      console.log("Loading editSession data:", editSession);
      console.log("Signature data from editSession:", {
        signatureImageData: editSession.signatureImageData,
        signatureName: editSession.signatureName,
        signatureNotes: editSession.signatureNotes,
      });

      setFormData({
        sessionDate: formattedDate,
        sessionTime: editSession.sessionTime || "",
        location: editSession.location || "",
        transportationRequired: editSession.transportationRequired || false,
        parentSignatureStatus: editSession.parentSignatureStatus || "pending",
        notes: editSession.notes || "",
        signatureData: editSession.signatureImageData || "",
        signatureName: editSession.signatureName || "",
        signatureNotes: editSession.signatureNotes || "",
      });
    }
  }, [editSession]);

  const locations = ["Centro", "Virtual", "Escuela", "Home"];
  const signatureStatuses = ["pending", "completed", "not_required"];
  const durations = [30, 45, 60, 90, 120];

  const handleInputChange = (
    field: keyof TherapySessionFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignatureSave = (signatureData: {
    signatureImageData: string;
    signedBy: string;
    signatureNotes?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      signatureData: signatureData.signatureImageData,
      signatureName: signatureData.signedBy,
      signatureNotes: signatureData.signatureNotes || "",
      parentSignatureStatus: "completed",
    }));
    setShowSignatureModal(false);
  };

  const handleClearSignature = () => {
    setFormData((prev) => ({
      ...prev,
      signatureData: "",
      signatureName: "",
      signatureNotes: "",
      parentSignatureStatus: "pending",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.sessionDate) {
      setError("Session date is required");
      return;
    }

    try {
      setLoading(true);

      let response: { data: BackendTherapySession };

      if (editSession) {
        // Prepare update data (without certificationDocumentId)
        const updateData: Partial<BackendTherapySession> = {
          sessionDate: formData.sessionDate,
          ...(formData.sessionTime &&
            formData.sessionTime.trim() !== "" && {
              sessionTime: formData.sessionTime.includes(":00")
                ? formData.sessionTime
                : `${formData.sessionTime}:00`,
            }),
          ...(formData.location &&
            formData.location.trim() !== "" && {
              location: formData.location,
            }),
          transportationRequired: formData.transportationRequired,
          ...(formData.parentSignatureStatus &&
            formData.parentSignatureStatus.trim() !== "" && {
              parentSignatureStatus: formData.parentSignatureStatus,
            }),
          ...(formData.notes &&
            formData.notes.trim() !== "" && {
              notes: formData.notes,
            }),
          ...(formData.signatureData && {
            SignatureImageData: formData.signatureData,
            SignatureName: formData.signatureName,
            SignatureNotes: formData.signatureNotes,
          }),
        };

        console.log("Updating session with data:", updateData);
        console.log("Raw formData:", formData);
        console.log("sessionTime value:", formData.sessionTime);
        console.log("sessionTime type:", typeof formData.sessionTime);
        response = await sessionService.updateSession(
          editSession.id,
          updateData
        );
        console.log("Session updated successfully:", response.data);
        console.log("Response data signature fields:", {
          signatureImageData: response.data.signatureImageData,
          signatureName: response.data.signatureName,
          signatureNotes: response.data.signatureNotes,
          signatureDate: response.data.signatureDate,
        });

        // Show success message
        setSuccess("Session updated successfully!");

        // Wait a moment to show the success message, then close modal
        setTimeout(() => {
          if (onSessionUpdated) {
            onSessionUpdated(response.data);
          }
        }, 1500);
      } else {
        // Prepare create data (with certificationDocumentId)
        const createData: Omit<
          BackendTherapySession,
          "id" | "createdAt" | "lastModifiedAt"
        > = {
          certificationDocumentId: certificationId,
          sessionDate: formData.sessionDate,
          ...(formData.sessionTime &&
            formData.sessionTime.trim() !== "" && {
              sessionTime: formData.sessionTime.includes(":00")
                ? formData.sessionTime
                : `${formData.sessionTime}:00`,
            }),
          ...(formData.location &&
            formData.location.trim() !== "" && {
              location: formData.location,
            }),
          transportationRequired: formData.transportationRequired,
          ...(formData.parentSignatureStatus &&
            formData.parentSignatureStatus.trim() !== "" && {
              parentSignatureStatus: formData.parentSignatureStatus,
            }),
          ...(formData.notes &&
            formData.notes.trim() !== "" && {
              notes: formData.notes,
            }),
          therapistId: "", // This will be set by the backend
          ...(formData.signatureData && {
            SignatureImageData: formData.signatureData,
            SignatureName: formData.signatureName,
            SignatureNotes: formData.signatureNotes,
          }),
        };

        console.log("Creating session with data:", createData);
        response = await sessionService.createSession(createData);
        console.log("Session created successfully:", response.data);
        console.log("Response data signature fields:", {
          signatureImageData: response.data.signatureImageData,
          signatureName: response.data.signatureName,
          signatureNotes: response.data.signatureNotes,
          signatureDate: response.data.signatureDate,
        });

        // Show success message
        setSuccess("Session created successfully!");

        // Wait a moment to show the success message, then close modal
        setTimeout(() => {
          if (onSessionCreated) {
            onSessionCreated(response.data);
          }
        }, 1500);
      }
    } catch (err) {
      console.error(
        `Error ${editSession ? "updating" : "creating"} session:`,
        err
      );
      setSuccess(""); // Clear success message on error
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editSession ? "update" : "create"} session`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editSession ? "Edit Therapy Session" : "Add Therapy Session"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {editSession
                  ? "Update therapy session details"
                  : "Record a new therapy session"}
              </p>
            </div>
            <button
              onClick={onClose}
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
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

        {/* Success Message */}
        {success && (
          <div className="m-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
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
            </div>
          </div>

          {/* Signature Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Signature
            </h3>

            <div className="space-y-4">
              {/* Existing Signature Display */}
              {formData.signatureData && (
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
                      src={formData.signatureData}
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
                  {formData.signatureData
                    ? "Update Signature"
                    : "Add Signature"}
                </button>

                {!formData.signatureData && (
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

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="transportationRequired"
                  checked={formData.transportationRequired}
                  onChange={(e) =>
                    handleInputChange(
                      "transportationRequired",
                      e.target.checked
                    )
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? editSession
                  ? "Updating..."
                  : "Creating..."
                : editSession
                ? "Update Session"
                : "Create Session"}
            </button>
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
                    signatureData: signature,
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
    </div>
  );
};

export default TherapySessionForm;
