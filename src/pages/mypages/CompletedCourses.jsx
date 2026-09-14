import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import axiosInstance from "../../api/axiosInstance";
import LmsAsyncState from "../../components/common/LmsAsyncState";

export default function CompletedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/api/student/completed-courses");
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Error fetching completed courses:", err);
      setError(err.response?.data?.message || "Failed to load completed courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!loading && courses.length) {
      const table = $("#dataTable").DataTable();
      return () => table.destroy();
    }
  }, [loading, courses]);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="card-title mb-0">Completed Courses</h4>
      </div>

      <div className="card-body">
        <LmsAsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && courses.length === 0}
          loadingLabel="Loading completed courses..."
          emptyTitle="No completed courses"
          emptyMessage="You haven’t completed any courses yet."
          emptyIcon="solar:diploma-bold-duotone"
          onRetry={fetchCourses}
          minHeight={180}
        >
          <table className="table bordered-table mb-0" id="dataTable">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Instructor</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td>{c.duration}</td>
                  <td>{c.instructor?.name}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </LmsAsyncState>
      </div>
    </div>
  );
}
