import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const StatesCards = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const fetchDashboardStats = async () => {
      try {
        const res = await axiosInstance.get("/api/student/dashboard-stats");
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // API stats or clean defaults
  const totalCourses = stats?.totalCourses ?? 1;
  const completedCourses = stats?.completedCourses ?? 0;

  const attendancePct = stats?.attendance?.percentage ?? 0;
  const attendancePresent = stats?.attendance?.present ?? 0;
  const attendanceTotal = stats?.attendance?.total ?? 0;

  const assignmentsSubmitted = stats?.assignments?.submitted ?? 0;
  const assignmentsTotal = stats?.assignments?.total ?? 0;

  const cards = [
    {
      title: "Total Courses",
      value: `${totalCourses} Enrolled`,
      subtitle: `${completedCourses} Completed`,
      icon: "solar:notebook-bold-duotone",
      link: "/courses",
    },
    {
      title: "Attendance Rate",
      value: `${attendancePct}%`,
      subtitle: `${attendancePresent}/${attendanceTotal} Days Present`,
      icon: "solar:user-check-bold-duotone",
      link: "/attendance",
    },
    {
      title: "Assignments",
      value: `${assignmentsSubmitted}/${assignmentsTotal}`,
      subtitle: "Tasks Submitted",
      icon: "solar:document-text-bold-duotone",
      link: "/assigments",
    },
    {
      title: "Completed Courses",
      value: `${completedCourses} Finished`,
      subtitle: "Certificates Earned",
      icon: "solar:medal-star-bold-duotone",
      link: "/completed-course",
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-3" style={{ color: isDark ? "#E2E8F0" : "#666" }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#1F2937";
  const borderColor = isDark ? "#334155" : "#E2E8F0";

  return (
    <div className="row g-4 mb-4 align-items-stretch">
      {cards.map((card, i) => (
        <div className="col-xl-3 col-md-6 col-12 d-flex" key={i}>
          <Link to={card.link} className="text-decoration-none w-100 d-flex">
            <div
              className="card w-100 d-flex flex-column justify-content-between"
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                padding: "20px",
                minHeight: "130px",
                boxShadow: isDark
                  ? "0 4px 20px rgba(0,0,0,0.3)"
                  : "0 4px 20px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 pe-2">
                  <span
                    className="text-xs fw-bold text-uppercase d-block mb-1"
                    style={{ color: "#FEBA01", letterSpacing: "0.5px" }}
                  >
                    {card.title}
                  </span>
                  <h3
                    className="fw-bold mb-1"
                    style={{
                      color: textColor,
                      fontSize: "22px",
                      lineHeight: "1.2",
                    }}
                  >
                    {card.value}
                  </h3>
                  <small style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "12px" }}>
                    {card.subtitle}
                  </small>
                </div>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    minWidth: "48px",
                    borderRadius: "14px",
                    background: "rgba(254, 186, 1, 0.15)",
                    border: "1px solid rgba(254, 186, 1, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FEBA01",
                  }}
                >
                  <Icon icon={card.icon} width="26" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default StatesCards;
