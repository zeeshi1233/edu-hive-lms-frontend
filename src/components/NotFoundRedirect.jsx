import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import LmsLoader from "./common/LmsLoader";

/** Fallback for unknown URLs */
const NotFoundRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LmsLoader label="Loading..." variant="page" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const home =
    role === "admin"
      ? "/admin-dashboard"
      : role === "teacher"
      ? "/teacher-dashboard"
      : "/student-dashboard";

  return <Navigate to={home} replace />;
};

export default NotFoundRedirect;
