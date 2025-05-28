import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PaymentForm from "./components/PaymentForm";
import AdminPage from "./components/AdminPage";
import ContractForm from "./components/ContractForm";
import ProfilePage from "./components/ProfilePage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ChangeAvatarPage from "./components/ChangeAvatarPage";
import HomeContent from "./components/HomeContent";
import MainLayout from "./components/MainLayout";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <GoogleOAuthProvider clientId="966794015874-5g0iktfn8junh19ctfuoua6bh9m815er.apps.googleusercontent.com">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout user={user} handleLogout={handleLogout}>
              <HomeContent />
            </MainLayout>
          }
        />

        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <MainLayout user={user} handleLogout={handleLogout}>
                <HomeContent />
              </MainLayout>
            )
          }
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <MainLayout user={user} handleLogout={handleLogout}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </MainLayout>
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <MainLayout user={user} handleLogout={handleLogout}>
                <Signup onSignupSuccess={handleSignupSuccess} />
              </MainLayout>
            )
          }
        />

        <Route
          path="/reset-password"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ResetPasswordPage />
              </MainLayout>
            )
          }
        />

        <Route
          path="/payment"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <PaymentForm />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ProfilePage user={user} onUpdateUser={handleLoginSuccess} />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/change-password"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ChangePasswordPage />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/change-avatar"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ChangeAvatarPage />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={
            <MainLayout user={user} handleLogout={handleLogout}>
              <ForgotPasswordPage />
            </MainLayout>
          }
        />

        <Route
          path="/admin"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <AdminPage user={user} />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/contracts"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ContractForm user={user} />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
