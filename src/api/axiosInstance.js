import axios from "axios";
import { getCookie, removeCookie } from "../utils/cookies";

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

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeCookie("token");
      removeCookie("role");
      removeCookie("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("profileId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
