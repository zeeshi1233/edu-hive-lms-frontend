import React, { useState, useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import axiosInstance from "../../api/axiosInstance";

export default function CompletedCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch completed courses from API
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/student/completed-courses"); // update with your real endpoint
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error fetching completed courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // Initialize DataTable after data is loaded
    const table = $("#dataTable").DataTable();
    return () => table.destroy();
  }, [courses]); // reinitialize whenever courses change

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="card-title mb-0">Completed Courses</h4>
      </div>

      <div className="card-body">
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
      </div>
    </div>
  );
}
