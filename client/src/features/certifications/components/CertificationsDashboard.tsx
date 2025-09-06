import React, { useState, useEffect } from "react";
import { certificationService } from "../services/certificationService";
import { CertificationsListTable } from "./CertificationsListTable";
import { CertificationModal } from "./CertificationModal";
import type { CertificationDocument } from "../types/certification.types";
import type { CertificationStats } from "../types/certification.types";

interface CertificationsDashboardProps {
  onCertificationClick: (certification: CertificationDocument) => void;
  initialFilters?: {
    patientId?: string;
    therapistId?: string;
    month?: number;
    year?: number;
    status?: string;
    search?: string;
  };
  stats?: CertificationStats | null;
  certifications?: CertificationDocument[];
}

export const CertificationsDashboard: React.FC<
  CertificationsDashboardProps
> = ({ stats, certifications: propCertifications, onCertificationClick }) => {
  const [certifications, setCertifications] = useState<CertificationDocument[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertification, setSelectedCertification] =
    useState<CertificationDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );

  // Load certifications data - use prop certifications if available, otherwise load from API
  useEffect(() => {
    if (propCertifications && propCertifications.length > 0) {
      // Use certifications from props
      setCertifications(propCertifications);
      setIsLoading(false);
      setError(null);
    } else {
      // Load from API if no certifications provided
      loadCertificationsData();
    }
  }, [propCertifications]);

  const loadCertificationsData = async (): Promise<CertificationDocument[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Load lightweight certifications from API
      const certificationsData =
        await certificationService.getCertificationListItems();

      // Convert to CertificationDocument format for compatibility
      const convertedCertifications: CertificationDocument[] =
        certificationsData.map((item) => ({
          id: item.id,
          patientId: "", // Not needed for list display
          patientName: item.patientName,
          therapistId: "", // Not needed for list display
          therapistName: "", // Not needed for list display
          month: item.month,
          year: item.year,
          therapyType: item.therapyType,
          sessionCount: item.sessionCount,
          totalSessions: item.sessionCount, // For compatibility
          completedSessions: 0, // Not needed for list display
          status: item.status as any,
          createdAt: item.createdAt,
          lastModifiedAt: item.createdAt,
          createdBy: "",
          lastModifiedBy: "",
          patient: undefined,
          therapist: undefined,
          sessions: undefined,
        }));

      setCertifications(convertedCertifications);
      return convertedCertifications;
    } catch (err) {
      console.error("Failed to load certifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load certifications"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificationClick = (certification: CertificationDocument) => {
    setSelectedCertification(certification);
    setModalMode("view");
    setIsModalOpen(true);
    onCertificationClick(certification);
  };

  const handleEditCertification = (certification: CertificationDocument) => {
    setSelectedCertification(certification);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteCertification = async (certificationId: string) => {
    try {
      await certificationService.deleteCertification(certificationId);
      // Reload certifications after deletion
      await loadCertificationsData();
    } catch (err) {
      console.error("Failed to delete certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete certification"
      );
    }
  };

  const handleSubmitCertification = async (certificationId: string) => {
    try {
      await certificationService.submitCertification(certificationId);
      // Reload certifications after submission
      await loadCertificationsData();
    } catch (err) {
      console.error("Failed to submit certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit certification"
      );
    }
  };

  const handleCreateCertification = () => {
    setSelectedCertification(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertification(null);
    setModalMode("view");
  };

  const handleModalSave = async (certificationData: any) => {
    try {
      if (modalMode === "create") {
        await certificationService.createCertification(certificationData);
      } else if (modalMode === "edit" && selectedCertification) {
        await certificationService.updateCertification(
          selectedCertification.id,
          certificationData
        );
      }

      // Reload certifications after save
      await loadCertificationsData();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save certification:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save certification"
      );
    }
  };

  // Add loading state for stats
  if (!stats) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            Loading certification statistics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col min-h-0">
      {/* Fixed Header with Stats and Add Button */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Stats Cards */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Total Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Certifications
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.totalCertifications || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Approved
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.approvedCertifications || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.submittedCertifications || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* This Month Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Month
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.thisMonthCertifications || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Header with Title and Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Certification Documents
            </h2>
            <button
              onClick={handleCreateCertification}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Certification
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Only the table content scrolls */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mx-6 mt-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading certifications...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="pb-8">
              <CertificationsListTable
                certifications={certifications}
                onCertificationClick={handleCertificationClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* Certification Modal */}
      <CertificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certificationId={selectedCertification?.id}
        mode={modalMode}
        onSave={handleModalSave}
      />
    </div>
  );
};
