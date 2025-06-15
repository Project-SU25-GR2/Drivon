import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import SimpleButton from "../others/SimpleButton";
import { Link } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      setError(
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
        "http://localhost:8080/api/auth/google",
        {
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Google login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
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

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>Or login with:</p>
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
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
