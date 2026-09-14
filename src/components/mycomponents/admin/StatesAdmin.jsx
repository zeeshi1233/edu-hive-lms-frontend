import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { extractList, loadScheduledClasses, mergeSessionLists } from "../../../utils/lmsData";
import LmsLoader from "../../common/LmsLoader";

const StatesAdmin = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalClasses: 0,
  });

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
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/dashboard");
        const incoming = response.data?.stats || response.data || {};

        let totalClasses =
          incoming.totalClasses || incoming.totalSessions || incoming.scheduledClasses || 0;

        if (!totalClasses) {
          const collected = [];
          for (const url of ["/api/admin/sessions", "/api/sessions"]) {
            try {
              const res = await axiosInstance.get(url);
              collected.push(...extractList(res, ["sessions", "classes", "data"]));
            } catch {
              // continue
            }
          }
          totalClasses = mergeSessionLists(collected, loadScheduledClasses()).length;
        }

        setStats({
          totalTeachers: incoming.totalTeachers || 0,
          totalStudents: incoming.totalStudents || 0,
          totalCourses: incoming.totalCourses || 0,
          totalClasses,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setStats((prev) => ({
          ...prev,
          totalClasses: loadScheduledClasses().length,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardsData = [
    {
      title: "Total Teachers",
      value: (stats.totalTeachers || 0).toLocaleString(),
      subtitle: "Verified teaching staff",
      icon: "solar:user-speak-rounded-bold-duotone",
      path: "/all-teacher",
    },
    {
      title: "Total Students",
      value: (stats.totalStudents || 0).toLocaleString(),
      subtitle: "Active academic learners",
      icon: "solar:users-group-two-rounded-bold-duotone",
      path: "/all-students",
    },
    {
      title: "Total Courses",
      value: (stats.totalCourses || 0).toLocaleString(),
      subtitle: "Published curriculum",
      icon: "solar:notebook-bold-duotone",
      path: "/all-courses",
    },
    {
      title: "Scheduled Classes",
      value: (stats.totalClasses || 0).toLocaleString(),
      subtitle: "From class calendar",
      icon: "solar:calendar-bold-duotone",
      path: "/class-calendar",
    },
  ];

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const borderColor = isDark ? "#334155" : "#E2E8F0";

  if (loading) {
    return <LmsLoader label="Loading admin metrics..." variant="inline" style={{ minHeight: 154 }} />;
  }

  return (
    <div className="row g-4 mb-1 align-items-stretch">
      {cardsData.map((card) => (
        <div className="col-xl-3 col-md-6 col-12 d-flex" key={card.title}>
          <div
            onClick={() => navigate(card.path)}
            className="card w-100 d-flex flex-column justify-content-between border-0 lms-stat-card"
            style={{
              padding: "22px",
              borderRadius: "18px",
              background: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark
                ? "0 8px 24px rgba(0,0,0,0.28)"
                : "0 8px 24px rgba(15, 23, 42, 0.05)",
              cursor: "pointer",
              minHeight: "154px",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1 pe-2">
                <span className="lms-kicker d-block mb-2">{card.title}</span>
                <h3
                  className="fw-bold mb-1"
                  style={{
                    color: textColor,
                    fontSize: "28px",
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {card.value}
                </h3>
                <small style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "13px" }}>
                  {card.subtitle}
                </small>
              </div>

              <div
                className="lms-stat-icon"
                style={{
                  width: "52px",
                  height: "52px",
                  minWidth: "52px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon icon={card.icon} width="28" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatesAdmin;
