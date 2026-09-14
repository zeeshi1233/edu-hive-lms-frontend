import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "../../../api/axiosInstance";
import LmsLoader from "../../common/LmsLoader";

const RevenueStates = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingFees: 0,
    collectedToday: 0,
  });

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
        setLoading(true);
        const response = await axiosInstance.get("/api/admin/revenue");
        setStats({
          pendingFees: response.data.stats.pendingFees,
          collectedToday: response.data.stats.collectedToday,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  const cardsData = [
    {
      title: "Pending Fees",
      value: (stats.pendingFees || 0).toLocaleString(),
      icon: "mdi:cash-clock",
      color: "#FF9F43",
    },
    {
      title: "Collected Today",
      value: (stats.collectedToday || 0).toLocaleString(),
      icon: "mdi:cash-check",
      color: "#7367F0",
    },
  ];

  const cardBg = isDark
    ? "linear-gradient(135deg,#1E293B,#111827)"
    : "rgba(255,255,255,0.65)";
  const pageBg = isDark ? "#0F172A" : "#F8F9FA";
  const textColor = isDark ? "#E2E8F0" : "#111";

  if (loading) {
    return (
      <div style={{ background: pageBg, padding: "20px" }}>
        <LmsLoader label="Loading revenue stats..." />
      </div>
    );
  }

  return (
    <div
      className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4"
      style={{ background: pageBg, padding: "20px", transition: "0.3s" }}
    >
      {cardsData.map((card, index) => (
        <div className="col" key={index}>
          <div
            className="card h-100 border-0"
            style={{
              padding: "20px",
              borderRadius: "22px",
              background: cardBg,
              backdropFilter: isDark ? "none" : "blur(15px)",
              boxShadow: isDark
                ? "0 4px 25px rgba(0,0,0,0.45)"
                : "0 10px 35px rgba(0,0,0,0.07), inset 0 1px 1px rgba(255,255,255,0.4)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              color: textColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = isDark
                ? "0 10px 35px rgba(0,0,0,0.6)"
                : "0 16px 45px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = isDark
                ? "0 4px 25px rgba(0,0,0,0.45)"
                : "0 10px 35px rgba(0,0,0,0.07), inset 0 1px 1px rgba(255,255,255,0.4)";
            }}
          >
            <div className="card-body p-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p
                    className="fw-semibold mb-1"
                    style={{ fontSize: "15px", color: card.color }}
                  >
                    {card.title}
                  </p>
                  <h5 className="fw-bold m-0" style={{ color: textColor }}>
                    {card.value}
                  </h5>
                </div>

                <div
                  className="rounded-circle d-flex justify-content-center align-items-center"
                  style={{
                    width: "55px",
                    height: "55px",
                    background: "#FEBA01",
                    boxShadow: `0 4px 12px ${card.color}55`,
                    transition: "0.3s ease",
                  }}
                >
                  <Icon icon={card.icon} style={{ fontSize: "26px", color: "#fff" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RevenueStates;
