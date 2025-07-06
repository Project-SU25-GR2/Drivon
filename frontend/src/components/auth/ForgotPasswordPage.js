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
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 số";
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
      showSuccessToast("Mã xác thực đã được gửi đến email của bạn");
      setCodeSent(true);
      setStep(2);
    } catch (err) {
      showErrorToast(err.response?.data || "Không thể gửi mã xác thực");
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
      showSuccessToast("Mã xác thực hợp lệ");
      setStep(3);
    } catch (err) {
      showErrorToast(err.response?.data || "Mã xác thực không hợp lệ");
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
      showErrorToast("Mật khẩu không khớp");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code: verificationCode,
        newPassword,
      });
      showSuccessToast("Đặt lại mật khẩu thành công");
      setTimeout(() => (window.location.href = "/auth"), 2000);
    } catch (err) {
      showErrorToast(err.response?.data || "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Quên mật khẩu</h2>
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
            Gửi mã xác thực
          </SimpleButton>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="auth-form">
          <div>
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="auth-input"
              required
              maxLength="6"
            />
          </div>

          <SimpleButton type="submit" isLoading={isLoading}>
            Xác thực
          </SimpleButton>

          <SimpleButton
            type="button"
            onClick={handleSendCode}
            style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
          >
            Gửi lại mã
          </SimpleButton>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div>
            <input
              type="password"
              placeholder="Mật khẩu mới"
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
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
              minLength="6"
            />
          </div>

          <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            Mật khẩu mới phải:
            <ul style={{ marginLeft: "20px" }}>
              <li>Có ít nhất 6 ký tự</li>
              <li>Chứa ít nhất 1 chữ hoa</li>
              <li>Chứa ít nhất 1 số</li>
            </ul>
          </div>

          <SimpleButton type="submit" isLoading={isLoading}>
            Đặt lại mật khẩu
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
