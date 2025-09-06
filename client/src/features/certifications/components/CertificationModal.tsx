import React, { useEffect, useState } from "react";
import { CertificationViewModal } from "./CertificationViewModal";
import { useApi } from "../../../shared/hooks";
import type { CertificationDocument } from "../types/certification.types";
import { certificationService } from "../services/certificationService";
import { useAuth } from "../../auth";

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificationId?: string;
  mode?: "view" | "edit" | "create";
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  certificationId,
  mode = "view",
}) => {
  const { user } = useAuth();
  const { loading, error, success, execute, clearMessages } = useApi();

  const [certification, setCertification] =
    useState<CertificationDocument | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load certification data
  useEffect(() => {
    if (isOpen && certificationId && mode !== "create") {
      loadCertification();
    }
  }, [isOpen, certificationId, mode]);

  const loadCertification = async () => {
    if (!certificationId) return;

    setIsLoadingData(true);
    try {
      const data = await certificationService.getCertificationById(
        certificationId
      );
      setCertification(data);
    } catch (err) {
      console.error("Failed to load certification:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async (
    certificationId: string | null,
    updatedData: Partial<CertificationDocument>
  ) => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      if (certificationId === null) {
        // Create mode
        const newCertification = await certificationService.createCertification(
          {
            ...updatedData,
            therapistId: user.id,
          }
        );
        setCertification(newCertification);
      } else {
        // Update mode
        const updatedCertification =
          await certificationService.updateCertification(certificationId, {
            ...updatedData,
            therapistId: user.id,
          });
        setCertification(updatedCertification);
      }
    } catch (err) {
      console.error("Failed to save certification:", err);
      throw err;
    }
  };

  const handleDelete = async (certificationId: string) => {
    try {
      await certificationService.deleteCertification(certificationId);
      onClose();
    } catch (err) {
      console.error("Failed to delete certification:", err);
    }
  };

  if (isLoadingData) {
    return (
      <CertificationViewModal
        certification={null}
        isOpen={isOpen}
        onClose={onClose}
        mode={mode}
      />
    );
  }

  return (
    <CertificationViewModal
      certification={certification}
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onDelete={handleDelete}
      mode={mode}
    />
  );
};
