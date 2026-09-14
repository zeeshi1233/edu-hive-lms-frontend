import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../../api/axiosInstance";
import {
  extractList,
  loadScheduledClasses,
  mergeSessionLists,
} from "../../../utils/lmsData";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const NumberOfClassesChart = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [sessions, setSessions] = useState([]);
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
    const load = async () => {
      const collected = [];
      const endpoints = ["/api/admin/sessions", "/api/sessions"];

      for (const url of endpoints) {
        try {
          const res = await axiosInstance.get(url);
          const list = extractList(res, ["sessions", "classes", "data"]);
          if (list.length) collected.push(...list);
        } catch {
          // try next endpoint
        }
      }

      setSessions(mergeSessionLists(collected, loadScheduledClasses()));
      setLoading(false);
    };

    load();
  }, []);

  const { labels, counts, total } = useMemo(() => {
    const now = new Date();
    const buckets = [];

    for (let i = 7; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        count: 0,
      });
    }

    sessions.forEach((session) => {
      const raw = session.startTime || session.date;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    });

    return {
      labels: buckets.map((b) => b.label),
      counts: buckets.map((b) => b.count),
      total: sessions.length,
    };
  }, [sessions]);

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, Poppins, sans-serif",
    },
    colors: ["#FEBA01"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: isDark ? "#94A3B8" : "#64748B",
          fontSize: "12px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: {
        formatter: (val) => Math.round(val),
        style: {
          colors: isDark ? "#94A3B8" : "#64748B",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val) => `${val} class${val === 1 ? "" : "es"}` },
    },
  };

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const borderColor = isDark ? "#334155" : "#E2E8F0";

  return (
    <div
      className="card border-0 h-100"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: "20px",
        boxShadow: isDark
          ? "0 8px 30px rgba(0,0,0,0.28)"
          : "0 8px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        className="card-header border-0 d-flex flex-wrap justify-content-between align-items-center gap-2 py-20 px-24"
        style={{ background: "transparent" }}
      >
        <div>
          <h5 className="fw-bold mb-1" style={{ color: textColor, fontSize: "20px" }}>
            Number of Classes
          </h5>
          <p className="mb-0" style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "13px" }}>
            Scheduled classes pulled from the Class Calendar
          </p>
        </div>
        <span
          className="badge"
          style={{
            background: "rgba(254, 186, 1, 0.18)",
            color: isDark ? "#FDE68A" : "#92400E",
            fontSize: "13px",
            fontWeight: 700,
            padding: "8px 12px",
            borderRadius: "999px",
          }}
        >
          {total} total
        </span>
      </div>
      <div className="card-body pt-0 px-24 pb-24">
        {loading ? (
          <p className="text-center py-5 mb-0" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
            Loading class schedule...
          </p>
        ) : (
          <ReactApexChart
            options={options}
            series={[{ name: "Number of Classes", data: counts }]}
            type="area"
            height={320}
          />
        )}
      </div>
    </div>
  );
};

export default NumberOfClassesChart;
