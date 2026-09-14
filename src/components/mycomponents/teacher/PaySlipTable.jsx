import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";

const PaySlipTable = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const teachers = [
    {
      name: "Jhon Doe",
      profileImage: "https://placehold.co/600x400",
      totalSalary: "Rs 50,000",
      status: "Released",
      releaseDate: "25 Nov 2025",
    },
    
  ];

  useEffect(() => {
    const table = $("#salaryTable").DataTable();
    return () => table.destroy();
  }, []);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Teacher Salaries</h5>
      </div>

      <div className="card-body">
        <table className="table bordered-table mb-0" id="salaryTable">
          <thead>
            <tr>
              <th>S.L</th>
              <th>Teacher</th>
              <th>Total Salary</th>
              <th>Status</th>
              <th>Release Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t, i) => (
              <tr key={i}>
                <td>{i + 1}</td>

                {/* Teacher Image + Name */}
                <td>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={t.profileImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    </div>
                    <span className="ms-2">{t.name}</span>
                  </div>
                </td>

                <td>{t.totalSalary}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      color: t.status === "Released" ? "#28C76F" : "#FF9F43",
                      background:
                        t.status === "Released"
                          ? "rgba(40,199,111,0.1)"
                          : "rgba(255,159,67,0.1)",
                      fontWeight: "600",
                    }}
                  >
                    {t.status}
                  </span>
                </td>
                <td>{t.releaseDate}</td>
                <td>
                  <button
                    className="btn d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "#FEBA01",
                    }}
                    onClick={() => setSelectedTeacher(t)}
                  >
                    <Icon icon="iconamoon:eye-light" width={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Salary Details Modal */}
      {selectedTeacher && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
          ></div>

          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div
                className="modal-content"
                style={{
                  borderRadius: "12px",
                  animation: "popIn 0.25s ease",
                  overflow: "hidden",
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

                <div className="modal-header" style={{ background: "#f7f9fc" }}>
                  <h5 className="modal-title fw-bold">Teacher Salary Details</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedTeacher(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="d-flex gap-3 mb-4">
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        boxShadow: "0 2px 6px #0002",
                      }}
                    >
                      <img
                        src={selectedTeacher.profileImage}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div>
                      <h4 className="fw-bold mb-1">{selectedTeacher.name}</h4>
                      <p>
                        <strong>Total Salary:</strong> {selectedTeacher.totalSalary}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedTeacher.status}
                      </p>
                      <p>
                        <strong>Release Date:</strong> {selectedTeacher.releaseDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn"
                    style={{ background: "#FEBA01" }}
                    onClick={() => setSelectedTeacher(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaySlipTable;
