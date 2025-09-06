import React, { useState, useEffect } from "react";
import { BaseModal } from "../../../shared/components/ui/BaseModal";
import { useResponsive } from "../../../hooks/useResponsive";
import type { PatientModalProps, Patient } from "../types/patient.types";

export const PatientModal: React.FC<PatientModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onEdit,
  mode = "view",
}) => {
  const { isMobile } = useResponsive();
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  const [isEditing, setIsEditing] = useState(
    mode === "edit" || mode === "create"
  );
  const [isSaving, setIsSaving] = useState(false);

  const isCreating = mode === "create";
  const isViewing = mode === "view" && !isEditing;

  // Initialize form data
  useEffect(() => {
    if (isCreating) {
      setEditedPatient({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        conditionsTherapyTypes: "",
        notes: "",
        assignedTherapistId: "",
      });
    } else if (patient) {
      setEditedPatient(patient);
    }
    setIsEditing(mode === "edit" || mode === "create");
  }, [patient, mode]);

  const handleFieldChange = (field: keyof Patient, value: any) => {
    setEditedPatient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(editedPatient);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) {
      onEdit();
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      onClose();
    } else {
      setIsEditing(false);
      setEditedPatient(patient || {});
    }
  };

  const handleDelete = async () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this patient?")
    ) {
      await onDelete();
    }
  };

  // Footer configuration
  const footerConfig = {
    buttons: isCreating
      ? [
          {
            label: "Cancel",
            variant: "secondary" as const,
            onClick: onClose,
            disabled: isSaving,
          },
          {
            label: isSaving ? "Creating..." : "Create",
            variant: "primary" as const,
            onClick: handleSave,
            loading: isSaving,
            disabled: isSaving,
          },
        ]
      : isEditing
      ? [
          ...(onDelete
            ? [
                {
                  label: "Delete",
                  variant: "danger" as const,
                  onClick: handleDelete,
                  disabled: isSaving,
                },
              ]
            : []),
          {
            label: "Cancel",
            variant: "secondary" as const,
            onClick: handleCancel,
            disabled: isSaving,
          },
          {
            label: isSaving ? "Saving..." : "Save",
            variant: "primary" as const,
            onClick: handleSave,
            loading: isSaving,
            disabled: isSaving,
          },
        ]
      : [
          {
            label: "Edit",
            variant: "primary" as const,
            onClick: handleEdit,
          },
          {
            label: "Close",
            variant: "secondary" as const,
            onClick: onClose,
          },
        ],
    buttonAlignment: "right" as const,
  };

  const renderField = (
    label: string,
    field: keyof Patient,
    type: string = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={editedPatient[field] || ""}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      ) : (
        <p className="text-sm text-gray-900 dark:text-white">
          {editedPatient[field] || "Not provided"}
        </p>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "Create Patient" : "Patient Details"}
      subtitle={
        isCreating
          ? "Add a new patient to the system"
          : `${patient?.fullName || "Patient"}`
      }
      footerConfig={footerConfig}
      contentClassName=""
    >
      <div className={`${isMobile ? "p-4" : "p-6"}`}>
        {/* Patient Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("Full Name", "fullName")}
              {renderField("Date of Birth", "dateOfBirth", "date")}
            </div>
          </div>

          {/* Legal Guardian Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Legal Guardian Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("Email", "email", "email")}
              {renderField("Phone", "phone", "tel")}
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Medical Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Impediment/Condition
                </label>
                {isEditing ? (
                  <textarea
                    value={editedPatient.conditionsTherapyTypes || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "conditionsTherapyTypes",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the patient's condition or impediment..."
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {editedPatient.conditionsTherapyTypes ||
                      "No condition specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={editedPatient.notes || ""}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes about the patient..."
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {editedPatient.notes || "No notes"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default PatientModal;
