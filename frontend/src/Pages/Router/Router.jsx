import React from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import AuthPage from "../AuthPage/AuthPage";
import FriendPage from "../FriendPage/FriendPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Component wrapper để giảm sự lặp lại của code
const ProtectedRouteWrapper = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const Router = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const token = localStorage.getItem("token");

  if (token && isAuthPage) {
    return <Navigate to="/" replace />;
  }
  return (
    <div>
      <div className="flex">
        {!isAuthPage && (
          <div className="w-[20%] border-l-slate-500">
            <Sidebar />
          </div>
        )}
        <div className="w-full">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRouteWrapper>
                  <HomePage />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/:username"
              element={
                <ProtectedRouteWrapper>
                  <Profile />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/friend"
              element={
                <ProtectedRouteWrapper>
                  <FriendPage />
                </ProtectedRouteWrapper>
              }
            />

            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Router;
