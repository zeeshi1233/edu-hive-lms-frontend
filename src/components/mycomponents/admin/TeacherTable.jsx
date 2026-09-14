import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import LmsLoader from "../../common/LmsLoader";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= GET ALL TEACHERS ================= */
  const getTeachers = async () => {
    try {
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

  /* ================= FILTER LOGIC ================= */
  const filteredTeachers = teachers.filter((t) => {
    if (startDate && t.createdAt && new Date(t.createdAt) < new Date(startDate)) {
      return false;
    }
    if (endDate && t.createdAt && new Date(t.createdAt) > new Date(endDate)) {
      return false;
    }
    if (selectedSubject) {
      const assigned = (t.assignedCourses || [])
        .map((c) => (typeof c === "string" ? c : c.title || c.name || ""))
        .join(" ")
        .toLowerCase();
      if (!assigned.includes(selectedSubject.toLowerCase()) && t.qualification !== selectedSubject) {
        return false;
      }
    }
    if (selectedStatus) {
      const isActiveStr = t.isActive ? "active" : "inactive";
      if (isActiveStr !== selectedStatus.toLowerCase()) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = t.name?.toLowerCase().includes(q);
      const emailMatch = t.email?.toLowerCase().includes(q);
      const qualMatch = t.qualification?.toLowerCase().includes(q);
      const courseMatch = (t.assignedCourses || [])
        .map((c) => (typeof c === "string" ? c : c.title || c.name || ""))
        .join(" ")
        .toLowerCase()
        .includes(q);
      if (!nameMatch && !emailMatch && !qualMatch && !courseMatch) return false;
    }
    return true;
  });

  /* ================= DATATABLE INIT ================= */
  useEffect(() => {
    if (!loading && filteredTeachers.length) {
      const table = $("#dataTable").DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
      });
      return () => table.destroy();
    }
  }, [loading, filteredTeachers]);

  const formatSalaryType = (type) => {
    if (type === "monthly") return "Monthly";
    if (type === "per_class") return "Per Class";
    return "N/A";
  };

  // Specialization options
  const assignedCourseNames = Array.from(
    new Set(
      teachers.flatMap(
        (t) =>
          t.assignedCourses?.map((c) =>
            typeof c === "string" ? c : c.title || c.name
          ).filter(Boolean) || []
      )
    )
  );

  const statusOptions = [
    { label: "Active Teachers", value: "active" },
    { label: "Inactive Teachers", value: "inactive" },
  ];

  const InfoRow = ({ label, children }) => (
    <div className="d-flex justify-content-between align-items-start py-2">
      <span
        style={{
          fontSize: "13px",
          color: "#94A3B8",
          minWidth: 110,
        }}
      >
        {label}
      </span>
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
      {/* Stat Summary Cards */}
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
              <h4 className="mb-0 fw-bold">
                {teachers.filter((t) => t.isActive).length}
              </h4>
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
              <small className="text-muted">Assigned Courses</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Teacher Directory Filtration"
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
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <LmsLoader label="Loading teachers..." style={{ minHeight: 180 }} />
          ) : (
            <table
              className="table bordered-table mb-0"
              id="dataTable"
              style={{ width: "100%" }}
            >
              <thead>
                <tr>
                  <th>S.L</th>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Qualification</th>
                  <th>Assigned Courses</th>
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
                          }}
                        >
                          <img
                            src={
                              t.profileImage ||
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                                t.name
                            }
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <span className="ms-2 fw-bold">{t.name}</span>
                      </div>
                    </td>

                    <td>{t.email}</td>
                    <td>{t.qualification}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {t.assignedCourses?.length ? (
                          t.assignedCourses.map((c, idx) => (
                            <span
                              key={idx}
                              className="badge"
                              style={{ background: "rgba(14, 165, 233, 0.15)", color: "#0284C7" }}
                            >
                              {typeof c === "string" ? c : c.title || c.name || "Course"}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
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
                        {/* VIEW */}
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
                        >
                          <Icon icon="iconamoon:eye-light" width={18} height={18} />
                        </button>

                        {/* EDIT */}
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

      {/* VIEW MODAL */}
      {selectedTeacher && (() => {
        const isDark =
          document.documentElement.getAttribute("data-theme") === "dark";

        const bg = isDark ? "#1E293B" : "#fff";
        const headerBg = isDark ? "#0F172A" : "#F8FAFC";
        const text = isDark ? "#E5E7EB" : "#111";
        const border = isDark ? "#334155" : "#E5E7EB";

        const badge = {
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 500,
          display: "inline-block",
        };

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
                    style={{
                      background: headerBg,
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={
                          selectedTeacher.profileImage ||
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                            selectedTeacher.name
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
                        <span
                          style={{
                            ...badge,
                            background: "#FEBA01",
                            color: "#000",
                          }}
                        >
                          {selectedTeacher.assignedCourses?.length
                            ? selectedTeacher.assignedCourses
                                .map((c) => (typeof c === "string" ? c : c.title || c.name))
                                .filter(Boolean)
                                .join(", ")
                            : "Instructor"}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn-close"
                      style={{ filter: isDark ? "invert(1)" : "none" }}
                      onClick={() => setSelectedTeacher(null)}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <span
                        style={{
                          ...badge,
                          background: isDark ? "#1F2937" : "#F3F4F6",
                        }}
                      >
                        Gender: <strong>{selectedTeacher.gender || "N/A"}</strong>
                      </span>

                      <span
                        style={{
                          ...badge,
                          background: isDark ? "#1F2937" : "#F3F4F6",
                        }}
                      >
                        Salary Type:{" "}
                        <strong>
                          {formatSalaryType(selectedTeacher.salaryType)}
                        </strong>
                      </span>

                      <span
                        style={{
                          ...badge,
                          background: selectedTeacher.isActive
                            ? "#DCFCE7"
                            : "#FEE2E2",
                          color: selectedTeacher.isActive ? "#166534" : "#991B1B",
                        }}
                      >
                        {selectedTeacher.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="row g-3 p-2">
                      <div className="col-md-6">
                        <InfoRow label="Email">
                          <a
                            href={`mailto:${selectedTeacher.email}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {selectedTeacher.email}
                          </a>
                        </InfoRow>

                        <InfoRow label="Phone">
                          {selectedTeacher.phone || "N/A"}
                        </InfoRow>

                        <InfoRow label="Qualification">
                          {selectedTeacher.qualification}
                        </InfoRow>

                        <InfoRow label="Assigned Courses">
                          {selectedTeacher.assignedCourses?.length
                            ? selectedTeacher.assignedCourses
                                .map((c) => (typeof c === "string" ? c : c.title || c.name))
                                .filter(Boolean)
                                .join(", ")
                            : "N/A"}
                        </InfoRow>
                      </div>

                      <div className="col-md-6">
                        <InfoRow label="Experience">
                          {selectedTeacher.experienceYears || 0} Years
                        </InfoRow>

                        <InfoRow label="Address">
                          {selectedTeacher.address || "N/A"}
                        </InfoRow>
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal-footer"
                    style={{ borderTop: `1px solid ${border}` }}
                  >
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
