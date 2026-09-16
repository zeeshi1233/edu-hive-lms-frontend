import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/teachers");
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeachers();
  }, []);

  useEffect(() => {
    const viewId = location.state?.viewTeacherId;
    if (!viewId || !teachers.length) return;
    const found = teachers.find((t) => String(t._id) === String(viewId));
    if (found) setSelectedTeacher(found);
  }, [location.state, teachers]);

  const courseLabel = (c) =>
    typeof c === "string" ? c : courseDisplayName(c) || c?.title || c?.name || "";

  const filteredTeachers = useMemo(() => {
    const start = dayStart(startDate);
    const end = dayStart(endDate);
    const q = searchQuery.trim().toLowerCase();

    return teachers.filter((t) => {
      const joinOrCreated = dayStart(t.joiningDate || t.createdAt);
      if (start && joinOrCreated && joinOrCreated < start) return false;
      if (end && joinOrCreated && joinOrCreated > end) return false;

      if (selectedSubject) {
        const assigned = (t.assignedCourses || []).map(courseLabel).join(" ").toLowerCase();
        const subject = selectedSubject.toLowerCase();
        if (!assigned.includes(subject) && String(t.qualification || "").toLowerCase() !== subject) {
          return false;
        }
      }

      if (selectedStatus) {
        const isActiveStr = t.isActive ? "active" : "inactive";
        if (isActiveStr !== selectedStatus.toLowerCase()) return false;
      }

      if (q) {
        const haystack = [
          t.name,
          t.email,
          t.phone,
          t.qualification,
          ...(t.assignedCourses || []).map(courseLabel),
          ...(t.boards || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [teachers, startDate, endDate, selectedSubject, selectedStatus, searchQuery]);

  const assignedCourseNames = useMemo(
    () =>
      Array.from(
        new Set(
          teachers.flatMap((t) =>
            (t.assignedCourses || [])
              .map(courseLabel)
              .filter((label) => hasValidCourseLabel(label))
          )
        )
      ),
    [teachers]
  );

  const statusOptions = [
    { label: "Active Teachers", value: "active" },
    { label: "Inactive Teachers", value: "inactive" },
  ];

  const InfoRow = ({ label, children }) => (
    <div className="d-flex justify-content-between align-items-start py-2">
      <span style={{ fontSize: "13px", color: "#94A3B8", minWidth: 110 }}>{label}</span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "right",
          maxWidth: "70%",
          lineHeight: 1.5,
        }}
      >
        {children}
      </span>
    </div>
  );

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 d-flex flex-row align-items-center gap-3" style={{ borderRadius: "14px" }}>
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
              <Icon icon="solar:user-speak-rounded-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{teachers.length}</h4>
              <small className="text-muted">Total Instructors</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 d-flex flex-row align-items-center gap-3" style={{ borderRadius: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="solar:user-check-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{teachers.filter((t) => t.isActive).length}</h4>
              <small className="text-muted">Active Teaching Staff</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 d-flex flex-row align-items-center gap-3" style={{ borderRadius: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3B82F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="solar:diploma-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{assignedCourseNames.length}</h4>
              <small className="text-muted">Courses Covered</small>
            </div>
          </div>
        </div>
      </div>

      <LmsFilterBar
        title="Teacher Directory Filtration"
        courseLabel="Course / Subject"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={assignedCourseNames}
        selectedCourse={selectedSubject}
        setSelectedCourse={setSelectedSubject}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        actions={
          <Link
            to="/add-teacher"
            className="btn d-flex align-items-center gap-1 fw-bold"
            style={{ background: "#FEBA01", color: "#000", borderRadius: "10px" }}
          >
            <Icon icon="ic:baseline-add" width={20} /> Add Teacher
          </Link>
        }
      />

      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">All Teachers</h5>
          <small className="text-muted">
            Showing {filteredTeachers.length} of {teachers.length}
          </small>
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <LmsLoader label="Loading teachers..." style={{ minHeight: 180 }} />
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-5 text-muted">No teachers match the current filters.</div>
          ) : (
            <table className="table bordered-table mb-0" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>S.L</th>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t, i) => (
                  <tr key={t._id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid #FEBA01",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              t.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                t.name || "teacher"
                              )}`
                            }
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <span className="ms-2 fw-bold">{t.name}</span>
                      </div>
                    </td>
                    <td>{t.email}</td>
                    <td>{t.qualification || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.isActive
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        }`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div
                        className="d-flex gap-2 align-items-center justify-content-center"
                        style={{ minWidth: "90px" }}
                      >
                        <button
                          type="button"
                          className="btn d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#FEBA01",
                          }}
                          onClick={() => setSelectedTeacher(t)}
                          title="View profile"
                        >
                          <Icon icon="iconamoon:eye-light" width={18} height={18} />
                        </button>
                        <button
                          type="button"
                          className="btn d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#0EA5E9",
                            color: "#fff",
                          }}
                          onClick={() => navigate("/add-teacher", { state: t })}
                          title="Edit teacher"
                        >
                          <Icon icon="solar:pen-outline" width={18} height={18} />
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

      {selectedTeacher &&
        (() => {
          const isDark =
            document.documentElement.getAttribute("data-theme") === "dark";
          const bg = isDark ? "#1E293B" : "#fff";
          const headerBg = isDark ? "#0F172A" : "#F8FAFC";
          const text = isDark ? "#E5E7EB" : "#111";
          const border = isDark ? "#334155" : "#E5E7EB";
          const assigned = (selectedTeacher.assignedCourses || [])
            .map(courseLabel)
            .filter((label) => hasValidCourseLabel(label));

          return (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(4px)",
                  zIndex: 1040,
                }}
                onClick={() => setSelectedTeacher(null)}
              />
              <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div
                    className="modal-content"
                    style={{
                      borderRadius: "14px",
                      background: bg,
                      color: text,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="modal-header"
                      style={{ background: headerBg, borderBottom: `1px solid ${border}` }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            selectedTeacher.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              selectedTeacher.name || "teacher"
                            )}`
                          }
                          width={60}
                          height={60}
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `2px solid ${border}`,
                          }}
                          alt=""
                        />
                        <div>
                          <h5 className="mb-1 fw-bold">{selectedTeacher.name}</h5>
                          <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                            {selectedTeacher.qualification || "Instructor"}
                            {selectedTeacher.isActive === false ? " · Inactive" : " · Active"}
                          </small>
                        </div>
                      </div>
                      <button
                        className="btn-close"
                        style={{ filter: isDark ? "invert(1)" : "none" }}
                        onClick={() => setSelectedTeacher(null)}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="row g-3 p-2">
                        <div className="col-md-6">
                          <InfoRow label="Email">
                            <a
                              href={`mailto:${selectedTeacher.email}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {selectedTeacher.email || "N/A"}
                            </a>
                          </InfoRow>
                          <InfoRow label="Phone">{selectedTeacher.phone || "N/A"}</InfoRow>
                          <InfoRow label="Gender">
                            {selectedTeacher.gender
                              ? String(selectedTeacher.gender).charAt(0).toUpperCase() +
                                String(selectedTeacher.gender).slice(1)
                              : "N/A"}
                          </InfoRow>
                          <InfoRow label="Qualification">
                            {selectedTeacher.qualification || "N/A"}
                          </InfoRow>
                        </div>
                        <div className="col-md-6">
                          <InfoRow label="Experience">
                            {selectedTeacher.experienceYears || 0} Years
                          </InfoRow>
                          <InfoRow label="Joining Date">
                            {selectedTeacher.joiningDate
                              ? new Date(selectedTeacher.joiningDate).toLocaleDateString()
                              : "N/A"}
                          </InfoRow>
                          <InfoRow label="Address">{selectedTeacher.address || "N/A"}</InfoRow>
                          <InfoRow label="Boards">
                            {(selectedTeacher.boards || []).length
                              ? selectedTeacher.boards.join(", ")
                              : "N/A"}
                          </InfoRow>
                        </div>
                      </div>

                      <div className="mt-3 px-2">
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#94A3B8",
                            marginBottom: 8,
                          }}
                        >
                          Assigned Courses
                        </div>
                        <div className="d-flex flex-wrap gap-2 align-items-start">
                          {assigned.length ? (
                            assigned.map((label, idx) => (
                              <span
                                key={`${label}-${idx}`}
                                className="badge"
                                style={{
                                  background: "rgba(14, 165, 233, 0.15)",
                                  color: "#0284C7",
                                  whiteSpace: "normal",
                                  textAlign: "left",
                                  lineHeight: 1.35,
                                  maxWidth: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontWeight: 600,
                                }}
                              >
                                {label}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">No courses assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: `1px solid ${border}` }}>
                      <button
                        className="btn"
                        style={{
                          background: "#0EA5E9",
                          color: "#fff",
                          fontWeight: 600,
                          padding: "8px 18px",
                          borderRadius: "8px",
                        }}
                        onClick={() => {
                          setSelectedTeacher(null);
                          navigate("/add-teacher", { state: selectedTeacher });
                        }}
                      >
                        Edit Teacher
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: "#FEBA01",
                          color: "#000",
                          fontWeight: 600,
                          padding: "8px 18px",
                          borderRadius: "8px",
                        }}
                        onClick={() => setSelectedTeacher(null)}
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

export default TeacherTable;
