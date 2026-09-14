import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const SessionHistory = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

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

  const chartBg = isDark ? "#1E293B" : "#FFFFFF";
  const labelColor = isDark ? "#E2E8F0" : "#777";
  const gridColor = isDark ? "rgba(226,232,240,0.1)" : "rgba(0,0,0,0.05)";
  const tooltipTheme = isDark ? "dark" : "light";

  const chartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: chartBg, // dynamic
      foreColor: labelColor,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#FEBA01"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: { style: { colors: labelColor } },
    },
    yaxis: {
      labels: { style: { colors: labelColor } },
      min: 0,
      max: 20,
    },
    grid: {
      borderColor: gridColor,
    },
    markers: {
      size: 5,
      colors: ["#FEBA01"],
      strokeWidth: 2,
      strokeColors: chartBg,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        colorStops: [
          { offset: 0, color: "#FEBA01", opacity: 0.4 },
          { offset: 100, color: "#FEBA01", opacity: 0 },
        ],
      },
    },
    tooltip: { theme: tooltipTheme },
  };

  const chartSeries = [
    {
      name: "Sessions",
      data: [5, 10, 7, 12, 9, 14],
    },
  ];

  return (
    <div
      id="chart"
      style={{
        background: chartBg,
        padding: "20px",
        borderRadius: "16px",
        transition: "0.3s",
      }}
    >
      <h5 className="fw-bold" style={{ color: labelColor }}>
        Session History
      </h5>
      {/* Using key forces re-render when dark mode changes */}
      <ReactApexChart
        key={isDark ? "dark" : "light"}
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={250}
      />
    </div>
  );
};

export default SessionHistory;
