import React from "react";
import { useAuth } from "../../auth";
import { useCertifications } from "../hooks/useCertifications";
import { Navigation } from "../../../shared/components/layout";
import { CertificationsDashboard } from "../components/CertificationsDashboard";
import { CertificationsPageSkeleton } from "../../../shared/components/ui";

const CertificationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  // Only get stats from the hook, let CertificationsDashboard handle its own data loading
  const { stats, viewCertification } = useCertifications({
    loadCertifications: false,
    includePatients: false,
    includeTherapists: false,
  });

  if (!isAuthenticated) {
    return <div>Please log in to view certifications.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Certifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage certification documents and approvals
          </p>
        </div>

        {/* Dashboard - Let it handle its own data loading */}
        <CertificationsDashboard
          stats={stats}
          onCertificationClick={viewCertification}
        />
      </main>
    </div>
  );
};

export default CertificationsPage;
