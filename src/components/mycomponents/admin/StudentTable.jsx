import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import LmsLoader from "../../common/LmsLoader";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/students");
        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredStudents = students.filter((s) => {
    if (startDate && s.admissionDate && new Date(s.admissionDate) < new Date(startDate)) {
      return false;
    }
    if (endDate && s.admissionDate && new Date(s.admissionDate) > new Date(endDate)) {
      return false;
    }
    if (selectedCourse) {
      const courseTitles = s.enrolledCourses?.map((c) => (c.course?.title || c.title || "").toLowerCase()) || [];
      if (!courseTitles.some((t) => t.includes(selectedCourse.toLowerCase()))) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = s.name?.toLowerCase().includes(q);
      const emailMatch = s.email?.toLowerCase().includes(q);
      const rollMatch = s._id?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !rollMatch) return false;
    }
    return true;
  });

  /* ================= INIT DATATABLE ================= */
  useEffect(() => {
    if (!loading && filteredStudents.length) {
      const table = $("#dataTable").DataTable({
        destroy: true,
        responsive: true,
      });
      return () => table.destroy();
    }
  }, [loading, filteredStudents]);

  // Extract unique courses for filter dropdown
  const allCourseNames = Array.from(
    new Set(
      students.flatMap((s) =>
        s.enrolledCourses?.map((c) => c.course?.title || c.title).filter(Boolean) || []
      )
    )
  );

  return (
    <>
      {/* Stat Summary Header */}
      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <div
            className="card p-3 d-flex flex-row align-items-center gap-3"
            style={{ borderRadius: "14px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(254, 186, 1, 0.15)",
                color: "#FEBA01",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="solar:users-group-two-rounded-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{students.length}</h4>
              <small className="text-muted">Total Enrolled Students</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Students Directory Filtration"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={allCourseNames}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        hideStatus
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        actions={
          <Link
            to="/add-student"
            className="btn d-flex align-items-center gap-1 fw-bold"
            style={{ background: "#FEBA01", color: "#000", borderRadius: "10px" }}
          >
            <Icon icon="ic:baseline-add" width={20} /> Add Student
          </Link>
        }
      />

      {/* ================= TABLE ================= */}
      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">All Students</h5>
        </div>

        <div className="card-body">
          {loading ? (
            <LmsLoader label="Loading students..." style={{ minHeight: 180 }} />
          ) : (
            <table className="table bordered-table mb-0" id="dataTable">
              <thead>
                <tr>
                  <th>S.L</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Enrolled Courses</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>

                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid #FEBA01",
                          }}
                        >
                          <img
                            src={
                              s.profileImage ||
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                                s.name
                            }
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="ms-2">
                          <div className="fw-bold">{s.name}</div>
                          {s.phone && (
                            <small className="text-muted">{s.phone}</small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{s.email}</td>
                    <td>
                      <span className="badge bg-light text-dark fw-bold">
                        {s._id ? s._id.slice(-6).toUpperCase() : "N/A"}
                      </span>
                    </td>

                    <td>
                      {s.enrolledCourses?.length ? (
                        <div className="d-flex flex-wrap gap-1">
                          {s.enrolledCourses.map((c, idx) => (
                            <span
                              key={idx}
                              className="badge"
                              style={{
                                background: "rgba(254, 186, 1, 0.2)",
                                color: "#854d0e",
                              }}
                            >
                              {c.course?.title || c.title || "Course"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">No Course Enrolled</span>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "#FEBA01",
                        }}
                        onClick={() => setSelectedStudent(s)}
                      >
                        <Icon icon="iconamoon:eye-light" width={22} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedStudent && (() => {
        const isDark =
          document.documentElement.getAttribute("data-theme") === "dark";

        const bg = isDark ? "#1E293B" : "#fff";
        const headerBg = isDark ? "#111827" : "#f7f9fc";
        const text = isDark ? "#E2E8F0" : "#111";
        const muted = isDark ? "#94A3B8" : "#6c757d";
        const border = isDark ? "#374151" : "#dee2e6";

        return (
          <>
            {/* BACKDROP */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                zIndex: 1040,
              }}
              onClick={() => setSelectedStudent(null)}
            />

            {/* MODAL */}
            <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div
                  className="modal-content"
                  style={{
                    background: bg,
                    color: text,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* HEADER */}
                  <div className="modal-header" style={{ background: headerBg }}>
                    <h5 className="modal-title fw-bold">Student Profile Details</h5>
                    <button
                      className="btn-close"
                      style={{ filter: isDark ? "invert(1)" : "none" }}
                      onClick={() => setSelectedStudent(null)}
                    />
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    <div className="d-flex gap-3 mb-4">
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px #0006",
                        }}
                      >
                        <img
                          src={
                            selectedStudent.profileImage ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                              selectedStudent.name
                          }
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div>
                        <h4 className="fw-bold mb-1">{selectedStudent.name}</h4>

                        <p className="mt-2 mb-0" style={{ color: muted }}>
                          Admission Date:{" "}
                          <strong>
                            {selectedStudent.admissionDate
                              ? new Date(selectedStudent.admissionDate).toLocaleDateString()
                              : "N/A"}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <hr style={{ borderColor: border }} />

                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Phone:</strong> {selectedStudent.phone || "N/A"}</p>
                        <p><strong>Gender:</strong> {selectedStudent.gender || "N/A"}</p>
                        <p>
                          <strong>DOB:</strong>{" "}
                          {selectedStudent.dateOfBirth
                            ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p><strong>Address:</strong> {selectedStudent.address || "N/A"}</p>
                      </div>

                      <div className="col-md-6">
                        <p><strong>Guardian:</strong> {selectedStudent.guardianName || "N/A"}</p>
                        <p><strong>Guardian Phone:</strong>{" "}
                          {selectedStudent.guardianPhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <hr style={{ borderColor: border }} />

                    <p>
                      <strong>Courses Enrolled:</strong>{" "}
                      {selectedStudent.enrolledCourses?.length
                        ? selectedStudent.enrolledCourses
                            .map((c) => c.course?.title || c.title || "")
                            .filter(Boolean)
                            .join(", ")
                        : "N/A"}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="modal-footer" style={{ borderTopColor: border }}>
                    <button
                      className="btn"
                      style={{ background: "#FEBA01", fontWeight: "bold" }}
                      onClick={() => setSelectedStudent(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
};

export default StudentTable;
