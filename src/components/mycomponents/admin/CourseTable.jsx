import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import { BOARD_LIST } from "../../../constants/boardOptions";
import {
  courseDisplayName,
  extractList,
  getCourseBoard,
  getCourseCode,
  getCourseId,
  getCourseTitle,
  generateCourseCode,
} from "../../../utils/lmsData";

const CourseTable = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* =======================  
     GET ALL COURSES
  ======================== */
  const getAllCourses = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/courses");
      const list = extractList(res, ["courses", "data"]);
      setCourses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/admin/courses/${deleteCourse._id || getCourseId(deleteCourse)}`);
      setCourses((prev) => prev.filter((c) => c._id !== deleteCourse._id));
      setDeleteCourse(null);
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredCourses = courses.filter((c) => {
    const board = getCourseBoard(c);
    const title = courseDisplayName(c);
    const code = getCourseCode(c);

    if (startDate && c.createdAt && new Date(c.createdAt) < new Date(startDate)) {
      return false;
    }
    if (endDate && c.createdAt && new Date(c.createdAt) > new Date(endDate)) {
      return false;
    }
    if (selectedBoard && board !== selectedBoard) {
      return false;
    }
    if (selectedStatus) {
      const activeStr = c.isActive === false ? "inactive" : "active";
      if (activeStr !== selectedStatus.toLowerCase()) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = title.toLowerCase().includes(q);
      const boardMatch = board.toLowerCase().includes(q);
      const codeMatch = code.toLowerCase().includes(q);
      if (!titleMatch && !boardMatch && !codeMatch) return false;
    }
    return true;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedBoard, selectedStatus, searchQuery, rowsPerPage]);

  /* ================= PAGINATION LOGIC ================= */
  const totalEntries = filteredCourses.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Boards / Categories list
  const boardsFromCourses = Array.from(
    new Set(courses.map((c) => getCourseBoard(c)).filter(Boolean))
  );
  const boards = Array.from(new Set([...BOARD_LIST, ...boardsFromCourses]));
  const statusOptions = [
    { label: "Active Courses", value: "active" },
    { label: "Inactive / Archived", value: "inactive" },
  ];

  return (
    <>
      {/* Stat Cards */}
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
              <Icon icon="solar:book-bookmark-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{courses.length}</h4>
              <small className="text-muted">Total Available Courses</small>
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
              <Icon icon="solar:check-circle-bold" width="26" />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">
                {courses.filter((c) => c.isActive !== false).length}
              </h4>
              <small className="text-muted">Published Active Courses</small>
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
              <h4 className="mb-0 fw-bold">{boardsFromCourses.length || boards.length}</h4>
              <small className="text-muted">Education Boards</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Courses Catalog Filtration"
        courseLabel="Education Board"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={boards}
        selectedCourse={selectedBoard}
        setSelectedCourse={setSelectedBoard}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        actions={
          <Link
            to="/add-course"
            className="btn d-flex align-items-center gap-1 fw-bold"
            style={{ background: "#FEBA01", color: "#000", borderRadius: "10px" }}
          >
            <Icon icon="ic:baseline-add" width={20} /> Add Course
          </Link>
        }
      />

      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0">All Courses</h5>
          {/* Rows per page selector */}
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0 text-muted small fw-semibold">Show</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <label className="mb-0 text-muted small fw-semibold">entries</label>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <p className="text-center py-4">Loading courses...</p>
          ) : filteredCourses.length === 0 ? (
            <p className="text-center py-4 text-muted">No courses found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>S.L</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Education Board</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCourses.map((c, i) => {
                    const courseId = getCourseId(c);
                    const code = getCourseCode(c) || generateCourseCode(getCourseTitle(c), getCourseBoard(c));
                    const board = getCourseBoard(c);
                    return (
                    <tr key={courseId || i} id={`course-row-${courseId}`}>
                      <td>{startIndex + i + 1}</td>

                      <td>
                        <span className="lms-chip lms-chip-gold">{code || "—"}</span>
                      </td>

                      <td>
                        <Link
                          to={`/course/${courseId}`}
                          className="fw-bold text-decoration-none"
                          style={{ color: "inherit" }}
                        >
                          {courseDisplayName(c)}
                        </Link>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={{ background: "rgba(59, 130, 246, 0.15)", color: "#1D4ED8" }}
                        >
                          {board || "Not assigned"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            c.isActive !== false ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {c.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn d-flex align-items-center justify-content-center p-0"
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#FEBA01",
                            }}
                            onClick={() => setSelectedCourse(c)}
                          >
                            <Icon icon="iconamoon:eye-light" width={20} />
                          </button>

                          <Link
                            to={`/edit-course/${courseId}`}
                            state={{ course: c }}
                            className="btn d-flex align-items-center justify-content-center p-0"
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#3B82F6",
                              color: "#fff",
                            }}
                          >
                            <Icon icon="mdi:pencil-outline" width={20} />
                          </Link>

                          <button
                            className="btn d-flex align-items-center justify-content-center p-0"
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#EF4444",
                              color: "#fff",
                            }}
                            onClick={() => setDeleteCourse(c)}
                          >
                            <Icon icon="mdi:delete-outline" width={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && totalEntries > 0 && (
          <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
            <span className="text-muted small">
              Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{" "}
              <strong>{totalEntries}</strong> entries
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0 gap-1">
                {/* Previous */}
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    style={{ borderRadius: "8px" }}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="mdi:chevron-left" width={16} />
                  </button>
                </li>

                {/* First page if not visible */}
                {getPageNumbers()[0] > 1 && (
                  <>
                    <li className="page-item">
                      <button className="page-link" style={{ borderRadius: "8px" }} onClick={() => goToPage(1)}>
                        1
                      </button>
                    </li>
                    {getPageNumbers()[0] > 2 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                  </>
                )}

                {/* Page numbers */}
                {getPageNumbers().map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button
                      className="page-link"
                      style={{
                        borderRadius: "8px",
                        background: currentPage === page ? "#FEBA01" : "",
                        borderColor: currentPage === page ? "#FEBA01" : "",
                        color: currentPage === page ? "#000" : "",
                        fontWeight: currentPage === page ? "bold" : "normal",
                      }}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                {/* Last page if not visible */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className="page-item">
                      <button
                        className="page-link"
                        style={{ borderRadius: "8px" }}
                        onClick={() => goToPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}

                {/* Next */}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    style={{ borderRadius: "8px" }}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Icon icon="mdi:chevron-right" width={16} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedCourse && (() => {
        const isDark =
          document.documentElement.getAttribute("data-theme") === "dark";

        const badgeStyle = (bg) => ({
          background: bg,
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
        });

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
              onClick={() => setSelectedCourse(null)}
            />

            <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div
                  className="modal-content"
                  style={{
                    borderRadius: "14px",
                    background: isDark ? "#1E293B" : "#fff",
                    color: isDark ? "#E2E8F0" : "#111",
                  }}
                >
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Course Details</h5>
                    <button
                      className="btn-close"
                      style={{ filter: isDark ? "invert(1)" : "none" }}
                      onClick={() => setSelectedCourse(null)}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="flex-grow-1 mb-3">
                      <h4 className="fw-bold mb-1">{courseDisplayName(selectedCourse)}</h4>

                      <div className="d-flex gap-2 flex-wrap mt-2">
                        {getCourseCode(selectedCourse) ? (
                          <span style={badgeStyle("#0F172A")}>
                            {getCourseCode(selectedCourse)}
                          </span>
                        ) : null}
                        <span style={badgeStyle("#3B82F6")}>
                          {getCourseBoard(selectedCourse) || "General Board"}
                        </span>
                        <span
                          style={badgeStyle(
                            selectedCourse.isActive !== false ? "#16A34A" : "#DC2626"
                          )}
                        >
                          {selectedCourse.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h6 className="fw-semibold mb-1">Description</h6>
                      <p className="text-muted mb-0">
                        {selectedCourse.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 d-flex justify-content-between text-muted small">
                      <span>
                        Created:{" "}
                        {selectedCourse.createdAt
                          ? new Date(selectedCourse.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <Link
                      to={`/course/${getCourseId(selectedCourse)}`}
                      className="btn btn-outline-secondary"
                    >
                      Open Course Link
                    </Link>
                    <button
                      className="btn"
                      style={{ background: "#FEBA01", color: "#000", fontWeight: "bold" }}
                      onClick={() => setSelectedCourse(null)}
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

      {/* DELETE MODAL */}
      {deleteCourse && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
            onClick={() => setDeleteCourse(null)}
          />

          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "12px" }}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-danger">Delete Course</h5>
                  <button className="btn-close" onClick={() => setDeleteCourse(null)} />
                </div>

                <div className="modal-body text-center">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    width={60}
                    className="text-danger mb-3"
                  />
                  <p className="fs-6 mb-0">
                    Are you sure you want to delete <br />
                    <strong>{deleteCourse.title}</strong>?
                  </p>
                </div>

                <div className="modal-footer justify-content-center">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDeleteCourse(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Yes, Delete"}
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

export default CourseTable;
