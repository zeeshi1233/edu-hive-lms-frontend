import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";

const RevenueTable = () => {
  const [selectedRevenue, setSelectedRevenue] = useState(null);

  // Dummy Revenue Data
  const revenues = [
    {
      studentName: "Ali Khan",
      rollNo: "STU-001",
      courseName: "Web Development",
      feePaid: "5000 PKR",
      feePending: "10000 PKR",
      totalFees: "15000 PKR",
      paymentDate: "10 Jan 2024",
      modeOfPayment: "Cash",
    },
    {
      studentName: "Sara Ahmed",
      rollNo: "STU-002",
      courseName: "Python",
      feePaid: "8000 PKR",
      feePending: "7000 PKR",
      totalFees: "15000 PKR",
      paymentDate: "15 Jan 2024",
      modeOfPayment: "Bank Transfer",
    },
    {
      studentName: "Bilal Raza",
      rollNo: "STU-003",
      courseName: "React JS",
      feePaid: "10000 PKR",
      feePending: "5000 PKR",
      totalFees: "15000 PKR",
      paymentDate: "20 Jan 2024",
      modeOfPayment: "Credit Card",
    },
  ];

  useEffect(() => {
    const table = $("#revenueTable").DataTable();
    return () => table.destroy();
  }, []);

  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  // Watch for theme changes dynamically
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

  const modalBg = isDark ? "#1E293B" : "#fff";
  const headerBg = isDark ? "#111827" : "#f7f9fc";
  const textColor = isDark ? "#E2E8F0" : "#111";
  const borderColor = isDark ? "#374151" : "#dee2e6";
  const buttonBg = "#FEBA01";

  return (
    <>
      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Revenue Details</h5>
        </div>

        <div className="card-body">
          <table className="table bordered-table mb-0" id="revenueTable">
            <thead>
              <tr>
                <th>S.L</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Course Name</th>
                <th>Fee Paid</th>
                <th>Fee Pending</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {revenues.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.studentName}</td>
                  <td>{r.rollNo}</td>
                  <td>{r.courseName}</td>
                  <td>{r.feePaid}</td>
                  <td>{r.feePending}</td>
                  <td>
                    <button
                      className="btn d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: buttonBg,
                      }}
                      onClick={() => setSelectedRevenue(r)}
                    >
                      <Icon icon="iconamoon:eye-light" width={60} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Details Modal */}
      {selectedRevenue && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
          ></div>

          {/* Modal */}
          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content"
                style={{
                  borderRadius: "12px",
                  animation: "popIn 0.25s ease",
                  overflow: "hidden",
                  background: modalBg,
                  color: textColor,
                }}
              >
                <style>
                  {`
                    @keyframes popIn {
                      0% { transform: scale(0.95); opacity: 0; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                  `}
                </style>

                {/* Header */}
                <div className="modal-header" style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}>
                  <h5 className="modal-title fw-bold">Revenue Details</h5>
                  <button
                    className="btn-close"
                    style={{ filter: isDark ? "invert(1)" : "none" }}
                    onClick={() => setSelectedRevenue(null)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="row mt-3">
                    <div className="col-md-6 mb-2">
                      <p>
                        <strong>Student Name:</strong> {selectedRevenue.studentName}
                      </p>
                      <p>
                        <strong>Roll No:</strong> {selectedRevenue.rollNo}
                      </p>
                      <p>
                        <strong>Course Name:</strong> {selectedRevenue.courseName}
                      </p>
                    </div>

                    <div className="col-md-6 mb-2">
                      <p>
                        <strong>Fee Paid:</strong> {selectedRevenue.feePaid}
                      </p>
                      <p>
                        <strong>Fee Pending:</strong> {selectedRevenue.feePending}
                      </p>
                      <p>
                        <strong>Total Fees:</strong> {selectedRevenue.totalFees}
                      </p>
                      <p>
                        <strong>Payment Date:</strong> {selectedRevenue.paymentDate}
                      </p>
                      <p>
                        <strong>Payment Mode:</strong> {selectedRevenue.modeOfPayment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <button
                    className="btn"
                    style={{ background: buttonBg, color: "#000", fontWeight: "bold" }}
                    onClick={() => setSelectedRevenue(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RevenueTable;
