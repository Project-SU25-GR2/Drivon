import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SimpleButton from "../others/SimpleButton";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        {
          token,
          newPassword,
        }
      );
      setMessage("Mật khẩu đã được đặt lại thành công");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <div style={{ color: "red" }}>Link không hợp lệ</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit} className="auth-form">
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
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>

        {message && (
          <div
            style={{
              color: "green",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#d4edda",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        <SimpleButton type="submit" isLoading={isLoading}>
          Đặt lại mật khẩu
        </SimpleButton>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
