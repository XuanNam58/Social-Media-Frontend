import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import AuthPage from "../AuthPage/AuthPage";
import FriendPage from "../FriendPage/FriendPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Nếu user là null thì false, nếu có user thì true, !!user sẽ chuyển đổi giá trị này thành một giá trị boolean.
      setLoading(false);
    });
    return () => unsubscribe();
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
  const auth = getAuth();
  const token = auth.currentUser.getIdToken();

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
