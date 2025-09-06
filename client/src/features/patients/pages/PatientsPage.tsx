import React, { useState } from "react";
import { useAuth } from "../../auth";
import { usePatients } from "../hooks/usePatients";
import { Navigation } from "../../../shared/components/layout";
import { PatientsList } from "../components/PatientsList";
import { PatientsPageSkeleton } from "../../../shared/components/ui";
import { PatientModal } from "../components/PatientModal";
import type { Patient } from "../types/patient.types";

const PatientsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    patients,
    isLoading,
    error,
    stats,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

  // Modal state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );

  // Modal handlers
  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditPatient = () => {
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setModalMode("view");
  };

  const handleSavePatient = async (patientData: any) => {
    try {
      if (modalMode === "create") {
        await createPatient(patientData);
      } else if (modalMode === "edit" && selectedPatient) {
        await updatePatient(selectedPatient.id, patientData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save patient:", error);
    }
  };

  const handleDeletePatient = async () => {
    if (selectedPatient) {
      try {
        await deletePatient(selectedPatient.id);
        handleCloseModal();
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view patients.</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <PatientsPageSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              Error loading patients: {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Patients
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your patients and their information
          </p>
        </div>

        {/* Patients List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Header with Add Button */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  All Patients
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {patients.length} patient{patients.length !== 1 ? "s" : ""}{" "}
                  total
                </p>
              </div>
              <button
                onClick={handleCreatePatient}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Add Patient
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Therapist Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Therapist
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="all">All Therapists</option>
                  <option value="me">My Patients</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="p-4 md:p-6">
            <PatientsList
              patients={patients}
              isLoading={isLoading}
              onPatientClick={handlePatientClick}
            />
          </div>
        </div>
      </main>

      {/* Patient Modal */}
      <PatientModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        onDelete={handleDeletePatient}
        onEdit={handleEditPatient}
        mode={modalMode}
      />
    </div>
  );
};

export default PatientsPage;
