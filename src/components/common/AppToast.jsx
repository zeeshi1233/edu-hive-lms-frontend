import React from "react";
import { ToastContainer } from "react-toastify";

/**
 * Global EduHive toast host — mount once near the app root.
 */
export default function AppToast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3200}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      limit={4}
      toastClassName="lms-toast"
      bodyClassName="lms-toast-body"
      progressClassName="lms-toast-progress"
      style={{ zIndex: 99999 }}
    />
  );
}
