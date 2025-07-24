import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../api/configApi';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user already has a password
    const checkPasswordStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.email) {
          navigate("/auth");
          return;
        }

        const response = await axios.get(
          `${API_URL}/profile/check-password-status/${user.email}`
        );
        setHasPassword(response.data.hasPassword);
      } catch (err) {
        console.error("Error checking password status:", err);
        setError("Unable to check password status");
      }
    };

    checkPasswordStatus();
  }, [navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least 1 lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least 1 number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least 1 special character (!@#$%^&*)";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Check confirm password
    if (newPassword !== confirmPassword) {
      setError("Confirm password does not match");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        throw new Error("User not found");
      }

      const endpoint = hasPassword
        ? "/profile/change-password"
        : "/profile/create-password";
      const payload = hasPassword
        ? { email: user.email, currentPassword, newPassword }
        : { email: user.email, newPassword };

      const response = await axios.post(
        `${API_URL}${endpoint}`, 
        payload
      );

      if (response.data.success) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError(
        err.response?.data?.error || "An error occurred while changing the password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">
            <i className="bi bi-key me-2"></i>
            {hasPassword ? "Change Password" : "Create New Password"}
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {hasPassword
                  ? "Password changed successfully!"
                  : "Password created successfully!"}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess(false)}
                ></button>
              </div>
            )}

            {hasPassword && (
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label password-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label password-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="form-text">
                Password must be at least 8 characters, including uppercase, lowercase, number, and special character
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label password-label">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={loading}
                style={{marginTop: "0 !important"}}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {hasPassword ? "Change Password" : "Create Password"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
