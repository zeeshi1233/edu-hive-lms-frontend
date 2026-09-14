import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import StatesCards from "./mycomponents/students/StatesCards";
import LectureSchedule from "./mycomponents/students/LectureSchedule";
import axiosInstance from "../api/axiosInstance";

const DashBoardLayerOne = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {});
  }, []);

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#1F2937";
  const borderColor = isDark ? "#334155" : "#E2E8F0";

  return (
    <div className="d-flex flex-column gap-4">
      {/* Student Welcome Banner */}
      <div
        className="p-4 rounded-16 position-relative overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1E293B, #0F172A)"
            : "linear-gradient(135deg, #FEBA01, #f59e0b)",
          color: "#000",
          borderRadius: "20px",
          boxShadow: isDark
            ? "0 4px 25px rgba(0,0,0,0.5)"
            : "0 6px 25px rgba(254, 186, 1, 0.25)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={
                  user?.profileImage ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                    (user?.name || "Student")
                }
                alt="Student Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h4
                className="fw-bold mb-0"
                style={{ color: isDark ? "#FEBA01" : "#000" }}
              >
                Welcome back, {user?.name || "Student"}! 👋
              </h4>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link
              to="/class-calendar"
              className="btn btn-dark fw-bold d-flex align-items-center gap-1"
              style={{ borderRadius: "10px", padding: "8px 16px" }}
            >
              <Icon icon="solar:calendar-bold" width="18" /> Class Calendar
            </Link>
            <Link
              to="/courses"
              className="btn btn-light fw-bold d-flex align-items-center gap-1"
              style={{ borderRadius: "10px", padding: "8px 16px", background: "#fff", color: "#000" }}
            >
              <Icon icon="solar:notebook-bold" width="18" /> My Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Student Metric Stat Cards (Equal width & height) */}
      <StatesCards />

      {/* Quick LMS Navigation Links */}
      <div className="row g-4 align-items-stretch">
        {[
          {
            title: "Class Calendar",
            icon: "solar:calendar-search-bold-duotone",
            link: "/class-calendar",
            desc: "View scheduled lectures & joining links",
          },
          {
            title: "Attendance Report",
            icon: "solar:clipboard-check-bold-duotone",
            link: "/attendance",
            desc: "Track daily present & absent history",
          },
          {
            title: "Fee Portal",
            icon: "solar:card-transfer-bold-duotone",
            link: "/fee-section",
            desc: "Semester fee summary & vouchers",
          },
          {
            title: "Monthly Progress",
            icon: "solar:chart-2-bold-duotone",
            link: "/monthly-progress",
            desc: "Performance trends & exam grades",
          },
        ].map((item, idx) => (
          <div key={idx} className="col-lg-3 col-md-6 col-12 d-flex">
            <Link to={item.link} className="text-decoration-none w-100 d-flex">
              <div
                className="p-3 d-flex align-items-center gap-3 w-100 h-100"
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "16px",
                  minHeight: "90px",
                  boxShadow: isDark
                    ? "0 4px 15px rgba(0,0,0,0.3)"
                    : "0 4px 15px rgba(0,0,0,0.03)",
                  transition: "0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    borderRadius: "12px",
                    background: "rgba(254, 186, 1, 0.15)",
                    border: "1px solid rgba(254, 186, 1, 0.3)",
                    color: "#FEBA01",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon icon={item.icon} width="24" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: textColor }}>
                    {item.title}
                  </h6>
                  <small style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "11px" }}>
                    {item.desc}
                  </small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Today's Schedule Table */}
      <div>
        <LectureSchedule />
      </div>
    </div>
  );
};

export default DashBoardLayerOne;