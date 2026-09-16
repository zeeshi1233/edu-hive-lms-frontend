import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import notify from "../../../utils/notify";

const AssignmentTable = () => {
  const tableRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleteAssignment, setDeleteAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteloading, setDeleteLoading] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= GET ALL ASSIGNMENTS ================= */
  const getAssignments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/teacher/assignments");
      setAssignments(res.data.assignments || []);
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssignments();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredAssignments = assignments.filter((a) => {
    if (startDate && a.dueDate && new Date(a.dueDate) < new Date(startDate)) {
      return false;
    }
    if (endDate && a.dueDate && new Date(a.dueDate) > new Date(endDate)) {
      return false;
    }
    if (
      selectedCourse &&
      !a.course?.title?.toLowerCase().includes(selectedCourse.toLowerCase())
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = a.title?.toLowerCase().includes(q);
      const courseMatch = a.course?.title?.toLowerCase().includes(q);
      if (!titleMatch && !courseMatch) return false;
    }
    return true;
  });

  /* ================= DATATABLE ================= */
  useEffect(() => {
    if (filteredAssignments.length && tableRef.current) {
      const table = $(tableRef.current).DataTable({
        destroy: true,
      });
      return () => table.destroy();
    }
  }, [filteredAssignments]);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteAssignment) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/api/teacher/assignments/${deleteAssignment._id}`);
      setDeleteAssignment(null);
      getAssignments();
      notify.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      notify.error("Failed to delete assignment");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Courses list
  const coursesList = Array.from(
    new Set(assignments.map((a) => a.course?.title).filter(Boolean))
  );

  return (
    <div>
      {/* Filter Bar */}
      <LmsFilterBar
        title="Teacher Assignments Filtration"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={coursesList}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        actions={
          <Link
            to="/upload-assignment"
            className="btn d-flex align-items-center gap-1 fw-bold"
            style={{ background: "#FEBA01", color: "#000", borderRadius: "10px" }}
          >
            <Icon icon="ic:baseline-add" width={20} /> Upload Assignment
          </Link>
        }
      />

      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">All Assignments</h5>
        </div>

        <div className="card-body">
          <table className="table bordered-table mb-0" ref={tableRef}>
            <thead>
              <tr>
                <th>S.L</th>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Marks</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssignments.map((a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}</td>
                  <td className="fw-bold">{a.title}</td>
                  <td>
                    <span
                      className="badge"
                      style={{ background: "rgba(59, 130, 246, 0.15)", color: "#1D4ED8" }}
                    >
                      {a.course?.title || "Course"}
                    </span>
                  </td>
                  <td>
                    {a.dueDate
                      ? new Date(a.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="fw-bold text-success">{a.maxMarks || 100} Marks</td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      {/* VIEW */}
                      <button
                        className="btn p-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "#FEBA01",
                          borderRadius: "6px",
                        }}
                        onClick={() => setSelectedAssignment(a)}
                      >
                        <Icon icon="iconamoon:eye-light" width={18} />
                      </button>

                      {/* EDIT */}
                      <Link
                        to={`/edit-assignment/${a._id}`}
                        state={{ assignment: a }}
                        className="btn p-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "#2563EB",
                          color: "#fff",
                          borderRadius: "6px",
                        }}
                      >
                        <Icon icon="mdi:pencil-outline" width={18} />
                      </Link>

                      {/* DELETE */}
                      <button
                        className="btn p-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "#DC2626",
                          color: "#fff",
                          borderRadius: "6px",
                        }}
                        onClick={() => setDeleteAssignment(a)}
                      >
                        <Icon icon="mdi:delete-outline" width={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <p className="text-center mt-3">Loading assignments...</p>}
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedAssignment && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
            onClick={() => setSelectedAssignment(null)}
          />

          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-3">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Assignment Details</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedAssignment(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Title:</strong> {selectedAssignment.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedAssignment.description || "No description provided."}
                  </p>
                  <p>
                    <strong>Course:</strong>{" "}
                    {selectedAssignment.course?.title || "N/A"}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {selectedAssignment.dueDate
                      ? new Date(selectedAssignment.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Maximum Marks:</strong> {selectedAssignment.maxMarks}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn fw-bold"
                    style={{ background: "#FEBA01", color: "#000" }}
                    onClick={() => setSelectedAssignment(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteAssignment && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
            onClick={() => setDeleteAssignment(null)}
          />

          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
              <div className="modal-content rounded-3 p-3">
                <div className="modal-body text-center d-flex flex-column justify-content-center align-items-center">
                  <Icon icon="mdi:alert-circle-outline" width="50" className="text-danger mb-2" />
                  <p className="fw-bold mb-2" style={{ fontSize: "16px" }}>
                    Are you sure you want to delete assignment?
                  </p>
                  <p className="mb-3 text-muted" style={{ fontSize: "14px" }}>
                    {deleteAssignment.title}
                  </p>
                  <div className="d-flex justify-content-center gap-3 w-100">
                    <button
                      className="btn btn-secondary flex-grow-1"
                      onClick={() => setDeleteAssignment(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger flex-grow-1"
                      onClick={handleDelete}
                      disabled={deleteloading}
                    >
                      {deleteloading ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignmentTable;
