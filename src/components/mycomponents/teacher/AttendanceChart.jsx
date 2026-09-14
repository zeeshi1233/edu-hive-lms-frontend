import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  const attendanceRef = useRef(null);
  const revenueRef = useRef(null);

  useEffect(() => {
  const ctx1 = attendanceRef.current.getContext("2d");
  const gradient1 = ctx1.createLinearGradient(0, 0, 0, 300);
  gradient1.addColorStop(0, "rgba(255, 193, 7, 0.7)");
  gradient1.addColorStop(1, "rgba(0, 0, 0, 0.2)");

  // Destroy old attendance chart
  if (attendanceRef.current.chartInstance) {
    attendanceRef.current.chartInstance.destroy();
  }

  attendanceRef.current.chartInstance = new Chart(ctx1, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [
        {
          label: "Attendance",
          data: [78, 82, 91, 86, 60],
          borderColor: "#FFC107",
          backgroundColor: gradient1,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#FFC107" } },
        y: { ticks: { color: "#FFC107" } },
      },
    },
  });

  const ctx2 = revenueRef.current.getContext("2d");
  const gradient2 = ctx2.createLinearGradient(0, 0, 0, 300);
  gradient2.addColorStop(0, "rgba(255, 193, 7, 0.8)");
  gradient2.addColorStop(1, "rgba(0, 0, 0, 0)");

  // Destroy old revenue chart
  if (revenueRef.current.chartInstance) {
    revenueRef.current.chartInstance.destroy();
  }

  revenueRef.current.chartInstance = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Revenue",
          data: [120000, 150000, 130000, 170000, 200000],
          backgroundColor: gradient2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#FFC107" } },
        y: { ticks: { color: "#FFC107" } },
      },
    },
  });
}, []);


  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div className="card p-3" style={{ background: "white", borderRadius: "20px" }}>
         <div className="mb-10 ">
                    <h6 className="text-lg fw-semibold mb-0">Attendance Overview</h6>
                </div>
          <canvas ref={attendanceRef} height="260"></canvas>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="card p-3" style={{ background: "white", borderRadius: "20px" }}>
          <p className=" mb-3" style={{}}>Revenue Chart</p>
          <canvas ref={revenueRef} height="260"></canvas>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
