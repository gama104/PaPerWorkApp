import React, { useState, useEffect } from "react";
import { useAuth } from "../features/auth";

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

const InvitationManager: React.FC = () => {
  const { user } = useAuth();
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

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/user/invitations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setInvitations(result.data || []);
      } else {
        setError("Failed to fetch invitations");
      }
    } catch (err) {
      setError("Failed to fetch invitations");
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
      const response = await fetch("/api/user/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

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
      } else {
        setError(result.message || "Failed to create invitation");
      }
    } catch (err) {
      setError("Failed to create invitation");
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
      const response = await fetch("/api/user/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(passwordResetEmail),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Password reset invitation created successfully!");
        setPasswordResetEmail("");
        setShowPasswordResetForm(false);
        fetchInvitations();
      } else {
        setError(
          result.message || "Failed to create password reset invitation"
        );
      }
    } catch (err) {
      setError("Failed to create password reset invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return;

    try {
      const response = await fetch(`/api/user/invitations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSuccess("Invitation deleted successfully!");
        fetchInvitations();
      } else {
        setError("Failed to delete invitation");
      }
    } catch (err) {
      setError("Failed to delete invitation");
    }
  };

  const handleResend = async (id: string) => {
    try {
      const response = await fetch(`/api/user/invitations/${id}/resend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSuccess("Invitation resent successfully!");
        fetchInvitations();
      } else {
        setError("Failed to resend invitation");
      }
    } catch (err) {
      setError("Failed to resend invitation");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Invitation link copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading invitations...</p>
      </div>
    );
  }

  const accountCreationInvitations = invitations.filter(
    (inv) => inv.invitationType === "createaccount"
  );
  const passwordResetInvitations = invitations.filter(
    (inv) => inv.invitationType === "resetpassword"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          User Invitation Management
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPasswordResetForm(!showPasswordResetForm)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {showPasswordResetForm ? "Cancel" : "Password Reset"}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showCreateForm ? "Cancel" : "Create New Invitation"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Password Reset Form */}
      {showPasswordResetForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create Password Reset Invitation
          </h3>
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User Email *
              </label>
              <input
                type="email"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="user@example.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the email of the user who needs to reset their password.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPasswordResetForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New User Invitation
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User Role *
                </label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="therapist">Therapist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about this invitation"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-medium text-gray-900">
            Account Creation Invitations
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Invitations for new users to create accounts
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountCreationInvitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {invitation.userRole}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invitation.isUsed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invitation.isUsed ? "Used" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => copyToClipboard(invitation.invitationLink)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Copy Link
                    </button>
                    {!invitation.isUsed && (
                      <>
                        <button
                          onClick={() => handleResend(invitation.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleDelete(invitation.id)}
                          className="text-red-600 hover:text-red-900"
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
            <div className="text-center py-8 text-gray-500">
              No account creation invitations found.
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Invitations */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
          <h3 className="text-lg font-medium text-gray-900">
            Password Reset Invitations
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Invitations for existing users to reset passwords
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {passwordResetInvitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {invitation.userRole}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invitation.isUsed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invitation.isUsed ? "Used" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => copyToClipboard(invitation.invitationLink)}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      Copy Link
                    </button>
                    {!invitation.isUsed && (
                      <>
                        <button
                          onClick={() => handleResend(invitation.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleDelete(invitation.id)}
                          className="text-red-600 hover:text-red-900"
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
            <div className="text-center py-8 text-gray-500">
              No password reset invitations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationManager;
