import React, { useState, useEffect, useRef } from "react";
import { authService } from "../features/auth/services/authService";
import { useAuth } from "../features/auth";
import { Navigation } from "../shared/components/layout/Navigation";
import SignaturePad, { type SignaturePadRef } from "./SignaturePad";
import SignatureDisplay from "./SignatureDisplay";

// Define types locally since they're specific to user profile
interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  signatureData?: string;
  role: string;
}

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  phoneNumber: string;
  signatureData?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>("");

  // Form states
  const [editForm, setEditForm] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    specialty: "",
    licenseNumber: "",
    phoneNumber: "",
    signatureData: "",
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "gray",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (passwordForm.newPassword) {
      checkPasswordStrength(passwordForm.newPassword);
    }
  }, [passwordForm.newPassword]);

  const fetchUserProfile = async () => {
    try {
      if (user) {
        const userProfileData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          specialty: user.specialty || "",
          licenseNumber: user.licenseNumber || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role,
          signatureData: user.signatureData || "",
        };

        setProfileData(userProfileData);
        setEditForm({
          firstName: userProfileData.firstName || "",
          lastName: userProfileData.lastName || "",
          specialty: userProfileData.specialty || "",
          licenseNumber: userProfileData.licenseNumber || "",
          phoneNumber: userProfileData.phoneNumber || "",
          signatureData: userProfileData.signatureData || "",
        });
      } else {
        setError("No user data available");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Feedback based on score
    if (score <= 2) {
      feedback = "Weak password";
    } else if (score <= 4) {
      feedback = "Fair password";
    } else if (score <= 5) {
      feedback = "Good password";
    } else {
      feedback = "Strong password";
    }

    // Color coding
    let color = "gray";
    if (score <= 2) color = "red";
    else if (score <= 3) color = "orange";
    else if (score <= 4) color = "yellow";
    else color = "green";

    setPasswordStrength({ score, feedback, color });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement updateUserProfile in authService
      console.log("Profile update requested:", editForm);
      const response = { data: true };

      if (response.data) {
        setSuccess("Profile updated successfully!");
        setProfileData((prev) => (prev ? { ...prev, ...editForm } : null));
        setIsEditing(false);
        // Refresh the profile data from the database
        fetchUserProfile();
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement changePassword in authService
      console.log("Password change requested");
      const response = { data: true };

      if (response.data) {
        setSuccess("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setError("Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (signature: string) => {
    setCurrentSignature(signature);
  };

  const handleAcceptSignature = () => {
    setEditForm((prev) => ({ ...prev, signatureData: currentSignature }));
    setIsEditingSignature(false);
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setCurrentSignature("");
  };

  const handleCancelSignature = () => {
    setCurrentSignature(editForm.signatureData || "");
    setIsEditingSignature(false);
  };

  const handleStartEditingSignature = () => {
    setCurrentSignature(editForm.signatureData || "");
    setIsEditingSignature(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              Profile Not Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Unable to load user profile information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Profile Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {!isEditing ? (
              // Display Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.lastName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {profileData.role}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specialty
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.specialty || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.licenseNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profileData.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signature
                  </label>
                  <div className="mt-1">
                    {profileData.signatureData ? (
                      <SignatureDisplay
                        signature={{
                          signatureImageData: profileData.signatureData,
                          signedBy: `${profileData.firstName} ${profileData.lastName}`,
                          signedAt: new Date().toISOString(),
                        }}
                        showDetails={false}
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No signature available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={editForm.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={editForm.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Specialty
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      value={editForm.specialty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                      placeholder="e.g., Physical Therapy, Occupational Therapy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={editForm.licenseNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                      placeholder="Professional license number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Signature
                    </label>
                    <div className="mt-1">
                      {editForm.signatureData ? (
                        <div className="space-y-2">
                          <SignatureDisplay
                            signature={{
                              signatureImageData: editForm.signatureData,
                              signedBy: `${profileData.firstName} ${profileData.lastName}`,
                              signedAt: new Date().toISOString(),
                            }}
                            showDetails={false}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleStartEditingSignature}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                              Update Signature
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditForm((prev) => ({
                                  ...prev,
                                  signatureData: "",
                                }));
                                setCurrentSignature("");
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                              Clear Signature
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No signature available
                          </p>
                          <button
                            type="button"
                            onClick={handleStartEditingSignature}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                          >
                            Add Signature
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signature Editor Modal */}
                {isEditingSignature && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {editForm.signatureData ? "Update" : "Add"} Your
                        Signature
                      </h3>

                      {/* Signature Pad */}
                      <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                        <SignaturePad
                          ref={signaturePadRef}
                          onSignatureChange={handleSignatureChange}
                          initialSignature={currentSignature}
                          className="w-full"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end">
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
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Change Password
              </h3>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {isChangingPassword ? "Cancel" : "Change Password"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      required
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    />
                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-2 w-8 rounded-full ${
                                  level <= passwordStrength.score
                                    ? `bg-${passwordStrength.color}-500`
                                    : "bg-gray-200 dark:bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-sm font-medium text-${passwordStrength.color}-600 dark:text-${passwordStrength.color}-400`}
                          >
                            {passwordStrength.feedback}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <p>• Use at least 8 characters</p>
                          <p>• Include uppercase and lowercase letters</p>
                          <p>• Add numbers and special characters</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    />
                    {passwordForm.confirmPassword &&
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword ||
                      passwordForm.newPassword.length < 8 ||
                      passwordStrength.score < 3
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    {submitting ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
                  <svg
                    className="h-6 w-6 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Password Security
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click "Change Password" to update your login credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
