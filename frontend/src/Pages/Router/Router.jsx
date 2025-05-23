import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import AuthPage from "../AuthPage/AuthPage";
import ChatInterface from "../../Components/Message/ChatInterface";
import FriendPage from "../FriendPage/FriendPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ForgotPassword from "../../Components/AuthForm/ForgotPassword";
import SettingsLayout from "../SettingPage/SettingsLayout";
import ChangePassword from "../../Components/Setting/ChangePassword";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

// Component wrapper để giảm sự lặp lại của code
const ProtectedRouteWrapper = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const Router = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const isForgotPasswordPage = location.pathname === "/forgot-password";
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      setIsAuthenticated(!!user);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated && isAuthPage) return <Navigate to="/" replace />;
  if (!isAuthenticated && !isAuthPage && !isForgotPasswordPage)
    return <Navigate to="/auth" replace />;

  return (
    <div>
      <div className="flex">
        {!isAuthPage && !isForgotPasswordPage && (
          <div className="w-[20%] border-l-slate-500">
            <Sidebar />
          </div>
        )}
        <div className="w-full">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friend"
              element={
                <ProtectedRoute>
                  <FriendPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            >
              <Route path="change-password" element={<ChangePassword />} />
              {/* Add other settings routes here */}
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/message" element={<ChatInterface />}></Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Router;
