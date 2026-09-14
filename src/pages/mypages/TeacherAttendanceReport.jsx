import React from "react";


const attendanceData = [
  { date: "02 Nov 2025", status: "Present", time: "09:00 AM" },
  { date: "03 Nov 2025", status: "Present", time: "09:02 AM" },
  { date: "04 Nov 2025", status: "Absent", time: "-" },
  { date: "05 Nov 2025", status: "Late", time: "09:18 AM" },
  { date: "06 Nov 2025", status: "Present", time: "08:59 AM" },
  { date: "07 Nov 2025", status: "Present", time: "09:01 AM" },
  { date: "08 Nov 2025", status: "Late", time: "09:14 AM" },
];

export default function TeacherAttendanceReport() {
  return (
    <div className="section p-24 radius-16 bg-base h-100">
      
      {/* Header */}
      <div className="mb-24">
        <h3 className="text-xl fw-bold">
          Attendance Report <span className="text-primary-600">(Fall 2025)</span>
        </h3>
      </div>

      {/* Stats Cards */}
    

      {/* Attendance Table */}
      <div className="card shadow-sm radius-16 p-0 mt-20">
        <div className="table-responsive rounded">
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.map((row, i) => (
                <tr key={i}>
                  <td className="fw-semibold">{row.date}</td>
                  <td>
                    <span className={`badge status-${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.time}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
