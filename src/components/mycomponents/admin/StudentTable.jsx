import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import LmsLoader from "../../common/LmsLoader";
import { courseDisplayName, hasValidCourseLabel } from "../../../utils/lmsData";

const dayStart = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const enrolledCourseLabel = (c) =>
  courseDisplayName(c?.course) ||
  c?.course?.title ||
  c?.title ||
  c?.courseTitle ||
  "";

const buildStudentEmailBody = (student) => {
  const courses = (student.enrolledCourses || [])
    .map(enrolledCourseLabel)
    .filter((label) => hasValidCourseLabel(label));

  return [
    `Student Profile — EduHive LMS`,
    ``,
    `Name: ${student.name || "N/A"}`,
    `Email: ${student.email || "N/A"}`,
    `Phone: ${student.phone || "N/A"}`,
    `Gender: ${student.gender || "N/A"}`,
    `Date of Birth: ${
      student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"
    }`,
    `Address: ${student.address || "N/A"}`,
    `Guardian: ${student.guardianName || "N/A"}`,
    `Guardian Phone: ${student.guardianPhone || "N/A"}`,
    `Admission Date: ${
      student.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString()
        : "N/A"
    }`,
    `Enrolled Courses: ${courses.length ? courses.join(", ") : "None"}`,
    ``,
    `— Sent from EduHive LMS`,
  ].join("\n");
};

const StudentTable = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, coursesRes] = await Promise.all([
          axiosInstance.get("/api/admin/students"),
          axiosInstance.get("/api/admin/courses").catch(() => null),
        ]);
        setStudents(studentsRes.data.students || []);
        const courseList =
          coursesRes?.data?.courses ||
          coursesRes?.data?.data ||
          (Array.isArray(coursesRes?.data) ? coursesRes.data : []);
        setAllCourses(courseList);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const courseFilterOptions = useMemo(() => {
    const fromApi = allCourses
      .map((c) => courseDisplayName(c))
      .filter((label) => hasValidCourseLabel(label));
    const fromStudents = students.flatMap((s) =>
      (s.enrolledCourses || [])
        .map(enrolledCourseLabel)
        .filter((label) => hasValidCourseLabel(label))
    );
    return Array.from(new Set([...fromApi, ...fromStudents]));
  }, [allCourses, students]);

  const filteredStudents = useMemo(() => {
    const start = dayStart(startDate);
    const end = dayStart(endDate);
    const q = searchQuery.trim().toLowerCase();

    return students.filter((s) => {
      const admission = dayStart(s.admissionDate || s.createdAt);
      if (start && admission && admission < start) return false;
      if (end && admission && admission > end) return false;

      if (selectedCourse) {
        const titles = (s.enrolledCourses || [])
          .map(enrolledCourseLabel)
          .map((t) => t.toLowerCase());
        if (!titles.some((t) => t.includes(selectedCourse.toLowerCase()))) {
          return false;
        }
      }

      if (selectedGender) {
        if (String(s.gender || "").toLowerCase() !== selectedGender.toLowerCase()) {
          return false;
        }
      }

      if (q) {
        const haystack = [
          s.name,
          s.email,
          s.phone,
          s.guardianName,
          s.guardianPhone,
          s.address,
          ...(s.enrolledCourses || []).map(enrolledCourseLabel),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [students, startDate, endDate, selectedCourse, selectedGender, searchQuery]);

  const handleSendEmail = (student) => {
    const defaultEmail = student.email || "";
    const recipient =
      window.prompt("Send student profile email to:", defaultEmail) || "";
    const trimmed = recipient.trim();
    if (!trimmed) return;

    const subject = encodeURIComponent(`EduHive Student Profile — ${student.name || ""}`);
    const body = encodeURIComponent(buildStudentEmailBody(student));
    window.open(`mailto:${trimmed}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <>
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

      <LmsFilterBar
        title="Students Directory Filtration"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={courseFilterOptions}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        hideStatus
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={() => setSelectedGender("")}
        extraFilters={
          <div className="col-lg-2 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="form-select"
              style={{ borderRadius: "10px", fontSize: "13px" }}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        }
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

      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">All Students</h5>
          <small className="text-muted">
            Showing {filteredStudents.length} of {students.length}
          </small>
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <LmsLoader label="Loading students..." style={{ minHeight: 180 }} />
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5 text-muted">No students match the current filters.</div>
          ) : (
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th>S.L</th>
                  <th>Student</th>
                  <th>Email</th>
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
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              s.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                s.name || "student"
                              )}`
                            }
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div className="ms-2">
                          <div className="fw-bold">{s.name}</div>
                          {s.phone && <small className="text-muted">{s.phone}</small>}
                        </div>
                      </div>
                    </td>
                    <td>{s.email}</td>
                    <td>
                      {s.enrolledCourses?.length ? (
                        <div className="d-flex flex-wrap gap-1 align-items-start">
                          {s.enrolledCourses.map((c, idx) => {
                            const label = enrolledCourseLabel(c);
                            if (!hasValidCourseLabel(label)) return null;
                            return (
                              <span
                                key={idx}
                                className="badge"
                                style={{
                                  background: "rgba(254, 186, 1, 0.2)",
                                  color: "#854d0e",
                                  whiteSpace: "normal",
                                  textAlign: "left",
                                  lineHeight: 1.35,
                                  maxWidth: 220,
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                }}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">No Course Enrolled</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          type="button"
                          className="btn d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "#FEBA01",
                          }}
                          onClick={() => setSelectedStudent(s)}
                          title="View profile"
                        >
                          <Icon icon="iconamoon:eye-light" width={18} />
                        </button>
                        <button
                          type="button"
                          className="btn d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "#0EA5E9",
                            color: "#fff",
                          }}
                          onClick={() => navigate("/add-student", { state: s })}
                          title="Edit student"
                        >
                          <Icon icon="solar:pen-outline" width={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedStudent &&
        (() => {
          const isDark =
            document.documentElement.getAttribute("data-theme") === "dark";
          const bg = isDark ? "#1E293B" : "#fff";
          const headerBg = isDark ? "#111827" : "#f7f9fc";
          const text = isDark ? "#E2E8F0" : "#111";
          const muted = isDark ? "#94A3B8" : "#6c757d";
          const border = isDark ? "#374151" : "#dee2e6";

          return (
            <>
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
                    <div className="modal-header" style={{ background: headerBg }}>
                      <h5 className="modal-title fw-bold">Student Profile Details</h5>
                      <button
                        className="btn-close"
                        style={{ filter: isDark ? "invert(1)" : "none" }}
                        onClick={() => setSelectedStudent(null)}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="d-flex gap-3 mb-4">
                        <div
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            overflow: "hidden",
                            boxShadow: "0 2px 6px #0006",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              selectedStudent.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                selectedStudent.name || "student"
                              )}`
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
                          <p>
                            <strong>Email:</strong> {selectedStudent.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {selectedStudent.phone || "N/A"}
                          </p>
                          <p>
                            <strong>Gender:</strong> {selectedStudent.gender || "N/A"}
                          </p>
                          <p>
                            <strong>DOB:</strong>{" "}
                            {selectedStudent.dateOfBirth
                              ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Address:</strong> {selectedStudent.address || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p>
                            <strong>Guardian:</strong>{" "}
                            {selectedStudent.guardianName || "N/A"}
                          </p>
                          <p>
                            <strong>Guardian Phone:</strong>{" "}
                            {selectedStudent.guardianPhone || "N/A"}
                          </p>
                        </div>
                      </div>

                      <hr style={{ borderColor: border }} />

                      <div>
                        <strong>Courses Enrolled:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {(selectedStudent.enrolledCourses || []).length ? (
                            selectedStudent.enrolledCourses.map((c, idx) => {
                              const label = enrolledCourseLabel(c);
                              if (!hasValidCourseLabel(label)) return null;
                              return (
                                <span
                                  key={idx}
                                  className="badge"
                                  style={{
                                    background: "rgba(254, 186, 1, 0.2)",
                                    color: "#854d0e",
                                    whiteSpace: "normal",
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                  }}
                                >
                                  {label}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer" style={{ borderTopColor: border }}>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: "#0EA5E9",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                        onClick={() => handleSendEmail(selectedStudent)}
                      >
                        <Icon icon="solar:letter-bold" className="me-1" width={16} />
                        Send Email
                      </button>
                      <button
                        type="button"
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
