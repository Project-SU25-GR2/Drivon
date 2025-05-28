import React, { useState } from "react";
import axios from "axios";
import Button from "./Button";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:8080/api/auth/send-reset-code", {
        email,
      });
      setMessage("Mã xác thực đã được gửi đến email của bạn");
      setCodeSent(true);
      setStep(2);
    } catch (err) {
      setError(err.response?.data || "Không thể gửi mã xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:8080/api/auth/verify-reset-code", {
        email,
        code: verificationCode,
      });
      setMessage("Mã xác thực hợp lệ");
      setStep(3);
    } catch (err) {
      setError(err.response?.data || "Mã xác thực không hợp lệ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        email,
        code: verificationCode,
        newPassword,
      });
      setMessage("Đặt lại mật khẩu thành công");
      setTimeout(() => (window.location.href = "/auth"), 2000);
    } catch (err) {
      setError(err.response?.data || "Không thể đặt lại mật khẩu");
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

          {message && <div className="success-message">{message}</div>}

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" isLoading={isLoading} className="auth-button">
            Gửi mã xác thực
          </Button>
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

          {message && <div className="success-message">{message}</div>}

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" isLoading={isLoading} className="auth-button">
            Xác thực
          </Button>

          <Button
            type="button"
            onClick={handleSendCode}
            className="auth-button secondary"
            style={{ marginTop: "10px" }}
          >
            Gửi lại mã
          </Button>
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

          {message && <div className="success-message">{message}</div>}

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" isLoading={isLoading} className="auth-button">
            Đặt lại mật khẩu
          </Button>
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
