import React, { useState } from "react";
import axios from "axios";
import SimpleButton from "../others/SimpleButton";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [codeSent, setCodeSent] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least 1 number";
    }
    return null;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/send-reset-code`, {
        email,  
      });
      showSuccessToast("Verification code has been sent to your email");
      setCodeSent(true);
      setStep(2);
    } catch (err) {
      showErrorToast(err.response?.data || "Unable to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/verify-reset-code`, {
        email,
        code: verificationCode,
      });
      showSuccessToast("Valid verification code");
      setStep(3);
    } catch (err) {
      showErrorToast(err.response?.data || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showErrorToast(passwordError);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code: verificationCode,
        newPassword,
      });
      showSuccessToast("Password reset successfully");
      setTimeout(() => (window.location.href = "/auth"), 2000);
    } catch (err) {
      showErrorToast(err.response?.data || "Unable to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={handleSendCode} className="auth-form">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <SimpleButton type="submit" isLoading={isLoading}>
            Send verification code
          </SimpleButton>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="auth-form">
          <div>
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="auth-input"
              required
              maxLength="6"
            />
          </div>

          <SimpleButton type="submit" isLoading={isLoading}>
            Verify
          </SimpleButton>

          <SimpleButton
            type="button"
            onClick={handleSendCode}
            style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
          >
            Resend code
          </SimpleButton>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="auth-form">
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
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
              minLength="6"
            />
          </div>

          <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            New password must:
            <ul style={{ marginLeft: "20px" }}>
              <li>Be at least 6 characters</li>
              <li>Contain at least 1 uppercase letter</li>
              <li>Contain at least 1 number</li>
            </ul>
          </div>

          <SimpleButton type="submit" isLoading={isLoading}>
            Reset password
          </SimpleButton>
        </form>
      )}

      <style jsx>{`
        .success-message {
          color: green;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #d4edda;
          border-radius: 4px;
        }
        .error-message {
          color: red;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
