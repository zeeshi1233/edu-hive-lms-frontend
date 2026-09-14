import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import LmsLoader from "./common/LmsLoader";

/**
 * Blocks all authenticated app pages when user is logged out.
 * Optionally restrict by role(s).
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LmsLoader label="Checking session..." variant="page" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    const fallback =
      role === "admin"
        ? "/admin-dashboard"
        : role === "teacher"
        ? "/teacher-dashboard"
        : role === "student"
        ? "/student-dashboard"
        : "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
