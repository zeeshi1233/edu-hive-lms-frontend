import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import axiosInstance from "../../api/axiosInstance";
import LmsFilterBar from "../../components/common/LmsFilterBar";
import LmsLoader from "../../components/common/LmsLoader";

export default function AttendanceReport() {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= THEME OBSERVER ================= */
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

  /* ================= FETCH LOGGED IN USER ================= */
  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  /* ================= FETCH ATTENDANCE ================= */
  useEffect(() => {
    if (!user || !user.enrolledCourses?.length) {
      setLoading(false);
      return;
    }

    const courseId =
      user.enrolledCourses[0]?.course?._id || user.enrolledCourses[0]?._id;

    axiosInstance
      .get(`/api/student/attendance/${courseId}`)
      .then((res) => {
        setAttendance(res.data.attendance || []);
        setSummary(res.data.summary);
      })
      .catch((err) => console.error("Attendance error", err))
      .finally(() => setLoading(false));
  }, [user]);

  /* ================= FILTER LOGIC ================= */
  const filteredAttendance = attendance.filter((row) => {
    if (startDate && row.date && new Date(row.date) < new Date(startDate)) {
      return false;
    }
    if (endDate && row.date && new Date(row.date) > new Date(endDate)) {
      return false;
    }
    if (
      selectedStatus &&
      row.status?.toLowerCase() !== selectedStatus.toLowerCase()
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const statusMatch = row.status?.toLowerCase().includes(q);
      const timeMatch = row.timeIn?.toLowerCase().includes(q);
      const dateMatch = new Date(row.date).toLocaleDateString().includes(q);
      if (!statusMatch && !timeMatch && !dateMatch) return false;
    }
    return true;
  });

  /* ================= DATATABLE INIT ================= */
  useEffect(() => {
    if (!filteredAttendance.length) return;

    const table = $("#dataTable").DataTable({
      destroy: true,
    });
    return () => table.destroy();
  }, [filteredAttendance]);

  /* ================= STYLES ================= */
  const bg = isDark ? "#0F172A" : "#F2F5F9";
  const cardBg = isDark
    ? "linear-gradient(135deg, #1f2937, #111827)"
    : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#111";

  const statusColors = {
    present: "#16A34A",
    absent: "#EF4444",
    late: "#FBBF24",
  };

  const statusOptions = [
    { label: "Present Days", value: "Present" },
    { label: "Absent Days", value: "Absent" },
    { label: "Late Arrival", value: "Late" },
  ];

  if (loading) {
    return <LmsLoader label="Loading attendance report..." variant="page" />;
  }

  return (
    <div
      style={{
        background: bg,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <h4 className="fw-bold mb-4" style={{ color: textColor }}>
        Attendance Log & Analytics
      </h4>

      {/* ================= STATS ================= */}
      {summary && (
        <div className="row g-4 mb-4">
          {[
            {
              label: "Present Days",
              value: summary.presentDays,
              color: statusColors.present,
            },
            {
              label: "Absent Days",
              value: summary.absentDays,
              color: statusColors.absent,
            },
            {
              label: "Attendance %",
              value: summary.attendancePercentage,
              color: statusColors.late,
            },
          ].map((stat, i) => (
            <div className="col-md-4" key={i}>
              <div
                style={{
                  background: cardBg,
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 25px rgba(0,0,0,0.45)"
                    : "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <h6 style={{ color: textColor, opacity: 0.7 }}>
                  {stat.label}
                </h6>
                <h3 style={{ color: stat.color, fontWeight: 700 }}>
                  {stat.value}
                  {stat.label === "Attendance %" && "%"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= FILTER BAR ================= */}
      <LmsFilterBar
        title="Attendance Logs Filter"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ================= TABLE ================= */}
      <div className="card mt-4">
        <div className="card-body">
          <table className="table bordered-table mb-0" id="dataTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No attendance records found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((row, i) => (
                  <tr key={i}>
                    <td className="fw-semibold">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            statusColors[row.status?.toLowerCase()] || "#999",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          background:
                            row.status?.toLowerCase() === "present"
                              ? "rgba(22, 163, 74, 0.15)"
                              : row.status?.toLowerCase() === "absent"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(251, 191, 36, 0.15)",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.timeIn || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
