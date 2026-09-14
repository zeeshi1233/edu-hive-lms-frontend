import { Icon } from "@iconify/react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AppContext";
import Cookies from "js-cookie";
const SignInLayer = () => {
  const navigate = useNavigate();

  const { setUser, setRole, setToken } = useAuth();
const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email & Password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let apiUrl = "";
      let redirectUrl = "";
      let finalRole = selectedRole || "admin";

      if (!selectedRole) {
        apiUrl = "/api/admin/login";
        redirectUrl = "/admin-dashboard";
      } else if (selectedRole === "teacher") {
        apiUrl = "/api/auth/teacher-login";
        redirectUrl = "/teacher-dashboard";
      } else {
        apiUrl = "/api/auth/student-login";
        redirectUrl = "/student-dashboard";
      }

      const res = await axiosInstance.post(apiUrl, {
        email,
        password,
      });

      const token = res.data.token;
      const userData = res.data.user || res.data.admin;

      // ✅ SAVE COOKIES
      Cookies.set("token", token, { expires: 7, path: "/" });
      Cookies.set("role", finalRole, { expires: 7, path: "/" });
      Cookies.set("user", JSON.stringify(userData), { expires: 7, path: "/" });

      // ✅ SAVE LOCALSTORAGE
      localStorage.setItem("token", token);
      localStorage.setItem("role", finalRole);
      localStorage.setItem("userId", userData.id || userData._id || "");
      localStorage.setItem("profileId", userData.profileId || userData.id || userData._id || "");
      localStorage.setItem("userName", userData.name || "");
      localStorage.setItem("userEmail", userData.email || "");
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Update state
      setToken(token);
      setRole(finalRole);
      setUser(userData);

      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth bg-base d-flex justify-content-center flex-wrap">
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center w-100">
        <div className="max-w-464-px mx-auto w-100 d-flex flex-column align-items-center">
          <Link to="/" className="mb-32 d-flex justify-content-center lms-pulse-gold" style={{ borderRadius: 20 }}>
            <img
              src="assets/images/logo.png"
              alt="EduHive"
              style={{ maxWidth: "180px" }}
            />
          </Link>

          <span className="lms-kicker mb-2">EduHive LMS</span>
          <h4 className="mb-8 text-center fw-bold" style={{ letterSpacing: "-0.02em" }}>
            Sign In to your Account
          </h4>
          <p className="mb-28 text-secondary-light text-lg text-center">
            Welcome back — please enter your details
          </p>

          <form className="w-100" onSubmit={(e) => e.preventDefault()}>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="icon-field mb-16 position-relative">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "48%",
                  transform: "translateY(-60%)",
                  cursor: "pointer",
                }}
              >
                <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
              </span>
            </div>

            <select
              className="form-control bg-neutral-50 radius-12"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            {error && (
              <p className="text-danger text-sm mb-4 mt-3 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="btn text-sm btn-sm px-12 py-16 w-100 radius-12 mt-16 fw-bold"
              style={{ backgroundColor: "#FEBA01", border: "none", color: "#111" }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
