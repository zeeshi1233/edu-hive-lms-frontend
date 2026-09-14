import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const TeacherState = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const cardsData = [
    {
      title: "Total Students",
      value: "0",
      icon: "fluent:people-team-24-filled",
      color: "#28C76F",
    },
    {
      title: "Upcoming Scheduled Classes",
      value: "0",
      icon: "mdi:calendar-check",
      color: "#FF9F43",
    },
    {
      title: "Total Hours Taught",
      value: "0",
      icon: "mdi:cash-multiple",
      color: "#7367F0",
    },
  ];

  const cardBg = isDark
    ? "linear-gradient(135deg, rgba(30,41,59,0.85), rgba(17,24,39,0.85))"
    : "rgba(255,255,255,0.65)";

  const textColor = isDark ? "#E2E8F0" : "#111";
  const subTextOpacity = isDark ? 0.7 : 1;
  const shadowDefault = isDark
    ? "0 10px 35px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)"
    : "0 10px 35px rgba(0,0,0,0.07), inset 0 1px 1px rgba(255,255,255,0.4)";

  return (
    <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
      {cardsData?.map((card, index) => (
        <div className="col" key={index}>
          <div
            className="card h-100 border-0"
            style={{
              padding: "20px",
              borderRadius: "22px",
              background: cardBg,
              backdropFilter: "blur(15px)",
              boxShadow: shadowDefault,
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = isDark
                ? "0 16px 45px rgba(0,0,0,0.5)"
                : "0 16px 45px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = shadowDefault;
            }}
          >
            <div className="card-body p-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p
                    className="fw-semibold mb-1"
                    style={{ fontSize: "15px", color: card.color, opacity: subTextOpacity }}
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
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#ECE8FF",
                    boxShadow: `0 4px 12px ${card.color}55`,
                    transition: "0.3s ease",
                  }}
                >
                  <Icon
                    icon={card.icon}
                    style={{ fontSize: "26px", color: card.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherState;
