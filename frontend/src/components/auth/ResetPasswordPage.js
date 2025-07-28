import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SimpleButton from "../others/SimpleButton";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          token,
          newPassword,
        }
      );
      showSuccessToast("Password has been reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Unable to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <div style={{ color: "red" }}>Invalid link</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>

        <SimpleButton type="submit" isLoading={isLoading}>
          Reset Password
        </SimpleButton>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
