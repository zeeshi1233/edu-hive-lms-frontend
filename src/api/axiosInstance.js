import axios from "axios";
import { getCookie } from "../utils/cookies";

/**
 * Axios main instance
 */
const axiosInstance = axios.create({
  baseURL: "https://eduhive-lms-backend.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ========================
// Request interceptor
// ========================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set the multipart boundary so teacher/student uploads parse correctly
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// Response interceptor
// ========================
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   removeCookie("token");
    //   removeCookie("role");
    //   removeCookie("user");
    //   window.location.href = "/";
    // }
    return Promise.reject(error);
  }
);

export default axiosInstance;
