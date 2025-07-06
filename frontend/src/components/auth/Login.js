import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import SimpleButton from "../others/SimpleButton";
import { Link } from "react-router-dom";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {   
          email,
          password,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        showSuccessToast('Đăng nhập thành công!');
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await axios.post(
        `${API_URL}/auth/google`,
        {
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        showSuccessToast('Đăng nhập Google thành công!');
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Google login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showErrorToast("Google login failed. Please try again.");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">

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
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>
        {/* <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link
            to="/forgot-password"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Quên mật khẩu?
          </Link>
        </div> */}
        <SimpleButton type="submit" isLoading={isLoading}>
          Login
        </SimpleButton>

        <div style={{ 
          marginTop: "20px", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <p>Or login with:</p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: "40px"
          }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              popup_type="popup"
              popup_properties={{
                width: 500,
                height: 600,
                left: window.screenX + (window.outerWidth - 500) / 2,
                top: window.screenY + (window.outerHeight - 600) / 2,
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
