import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import LmsLoader from "./common/LmsLoader";

/**
 * Login/public pages — redirect logged-in users to their dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LmsLoader label="Loading..." variant="page" />;
  }

  if (isAuthenticated) {
    const fallback =
      role === "admin"
        ? "/admin-dashboard"
        : role === "teacher"
        ? "/teacher-dashboard"
        : role === "student"
        ? "/student-dashboard"
        : "/admin-dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default PublicRoute;
