import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import PaymentForm from "./components/payment/PaymentForm";
import AdminPage from "./components/admin/AdminPage";
import ContractForm from "./components/contract/ContractForm";
import ProfilePage from "./components/profile/ProfilePage";
import ChangePasswordPage from "./components/auth/ChangePasswordPage";
import ChangeAvatarPage from "./components/profile/ChangeAvatarPage";
import HomeContent from "./components/home/HomeContent";
import MainLayout from "./components/home/MainLayout";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import RentYourCarForm from "./components/contract/RentYourCarForm";
import CarLeaseContractForm from "./components/contract/CarLeaseContractForm";
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
            <MainLayout user={user} handleLogout={handleLogout}>
              <AdminPage user={user} />
            </MainLayout>
          }
        />

        <Route
          path="/contracts"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <ContractForm />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/contracts/lease"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <CarLeaseContractForm user={user} />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/rent-your-car"
          element={
            user ? (
              <MainLayout user={user} handleLogout={handleLogout}>
                <RentYourCarForm />
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
