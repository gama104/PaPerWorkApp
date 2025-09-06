import React, { useState, useEffect } from "react";
import { useAuth } from "../features/auth";
import { Navigation } from "../shared/components/layout/Navigation";
import { authService } from "../features/auth/services/authService";
import { useNavigate } from "react-router-dom";

interface UserInvitationResponse {
  id: string;
  email: string;
  userRole: string;
  invitationType: string;
  expiryDate: string;
  isUsed: boolean;
  createdAt: string;
  createdByUserName: string;
  notes: string;
  invitationLink: string;
}

interface CreateUserInvitationRequest {
  email: string;
  userRole: string;
  invitationType: string;
  expiryDays: number;
  notes: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<UserInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserInvitationRequest>({
    email: "",
    userRole: "therapist",
    invitationType: "createaccount",
    expiryDays: 7,
    notes: "",
  });
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchInvitations();
    }
  }, [user]);

  // Monitor authentication state and redirect if needed
  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const fetchInvitations = async () => {
    try {
      const baseURL = authService.getBaseURL();
      const token = authService.getToken();

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        // Redirect to login after a short delay
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const response = await fetch(`${baseURL}/user/invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setInvitations(result.data || []);
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message ||
            `Failed to fetch invitations (${response.status})`
        );
      }
    } catch (err) {
      console.error("Fetch invitations error:", err);

      // Check if it's an authentication error from authService
      if (err instanceof Error && err.message === "Authentication required") {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          "Network error: Failed to fetch invitations. Please check if the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${authService.getBaseURL()}/user/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess("Invitation created successfully!");
        setFormData({
          email: "",
          userRole: "therapist",
          invitationType: "createaccount",
          expiryDays: 7,
          notes: "",
        });
        setShowCreateForm(false);
        fetchInvitations();
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.message || "Failed to create invitation");
      }
    } catch (err) {
      console.error("Create invitation error:", err);

      // Check if it's an authentication error
      if (err instanceof Error && err.message === "Authentication required") {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Network error: Failed to create invitation");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${authService.getBaseURL()}/user/password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(passwordResetEmail),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess("Password reset invitation created successfully!");
        setPasswordResetEmail("");
        setShowPasswordResetForm(false);
        fetchInvitations();
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          result.message || "Failed to create password reset invitation"
        );
      }
    } catch (err) {
      console.error("Password reset error:", err);

      // Check if it's an authentication error
      if (err instanceof Error && err.message === "Authentication required") {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Network error: Failed to create password reset invitation");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return;

    try {
      const response = await fetch(
        `${authService.getBaseURL()}/user/invitations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("Invitation deleted successfully!");
        fetchInvitations();
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to delete invitation");
      }
    } catch (err) {
      console.error("Delete invitation error:", err);

      // Check if it's an authentication error
      if (err instanceof Error && err.message === "Authentication required") {
        setError("Authentication failed. Please log in again.");
        // Clear invalid auth data and redirect to login
        authService.logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Network error: Failed to delete invitation");
      }
    }
  };

  const handleResend = async (id: string) => {
    try {
      const response = await fetch(
        `${authService.getBaseURL()}/user/invitations/${id}/resend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("Invitation resent successfully!");
        fetchInvitations();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to resend invitation");
      }
    } catch (err) {
      console.error("Resend invitation error:", err);
      setError("Network error: Failed to resend invitation");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Invitation link copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Access Denied
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Admin privileges required to access user management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading user management...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const accountCreationInvitations = invitations.filter(
    (inv) => inv.invitationType === "CreateAccount"
  );
  const passwordResetInvitations = invitations.filter(
    (inv) => inv.invitationType === "ResetPassword"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage user invitations, account creation, and password resets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowPasswordResetForm(!showPasswordResetForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            {showPasswordResetForm ? "Cancel" : "Password Reset"}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {showCreateForm ? "Cancel" : "Create New Invitation"}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {error.includes("Authentication") && (
                <span className="text-sm opacity-75">
                  Redirecting to login...
                </span>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-red-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Password Reset Form */}
        {showPasswordResetForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Create Password Reset Invitation
            </h3>
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Email *
                </label>
                <input
                  type="email"
                  value={passwordResetEmail}
                  onChange={(e) => setPasswordResetEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the email of the user who needs to reset their password.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordResetForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Reset Invitation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Creation Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Create New User Invitation
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Role *
                  </label>
                  <select
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="therapist">Therapist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiry Days *
                  </label>
                  <input
                    type="number"
                    name="expiryDays"
                    min="1"
                    max="30"
                    required
                    value={formData.expiryDays}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Optional notes about this invitation"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Invitation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Creation Invitations */}
        <div className="mb-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Account Creation Invitations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Invitations for new users to create accounts
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {accountCreationInvitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {invitation.userRole}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invitation.isUsed
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {invitation.isUsed ? "Used" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invitation.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          copyToClipboard(invitation.invitationLink)
                        }
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Copy Link
                      </button>
                      {!invitation.isUsed && (
                        <>
                          <button
                            onClick={() => handleResend(invitation.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleDelete(invitation.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accountCreationInvitations.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No account creation invitations found.
              </div>
            )}
          </div>
        </div>

        {/* Password Reset Invitations */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Password Reset Invitations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Invitations for existing users to reset passwords
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {passwordResetInvitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {invitation.userRole}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invitation.isUsed
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {invitation.isUsed ? "Used" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invitation.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          copyToClipboard(invitation.invitationLink)
                        }
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                      >
                        Copy Link
                      </button>
                      {!invitation.isUsed && (
                        <>
                          <button
                            onClick={() => handleResend(invitation.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleDelete(invitation.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {passwordResetInvitations.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No password reset invitations found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
