import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";


const TeacherMonthlyProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= GET STUDENT PROGRESS ================= */
  const getProgress = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/api/teacher/get-students-progress"
      );
      setProgressData(res.data.progressData || []);
    } catch (error) {
      console.error("Failed to load progress", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProgress();
  }, []);

  /* ================= HELPERS ================= */
  const getPerformance = (percentage) => {
    if (percentage >= 85) return { label: "Excellent", color: "success", status: "Outstanding" };
    if (percentage >= 70) return { label: "Good", color: "primary", status: "On Track" };
    if (percentage >= 50) return { label: "Average", color: "warning", status: "Needs Improvement" };
    return { label: "Poor", color: "danger", status: "At Risk" };
  };

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex justify-content-between mb-16">
            <div>
              <h5 className="fw-bold mb-0">Monthly Student Progress</h5>
              <span className="text-sm text-secondary-light">
                January 2026
              </span>
            </div>
          </div>

          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th className="text-center">Attendance</th>
                  <th className="text-center">Assignments</th>
                  <th className="text-center">Quiz Avg</th>
                  <th className="text-center">Performance</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading &&
                  progressData.map((course) =>
                    course.students.map((student) => {
                      const attendancePercent = Math.round(
                        (student.attendance.present /
                          student.attendance.total) *
                          100
                      );

                      const perf = getPerformance(
                        Number(student.scores.percentage)
                      );

                      return (
                        <tr key={student.studentId}>
                          <td>
                            <div>
                              <h6 className="text-md mb-0 fw-medium">
                                {student.name}
                              </h6>
                              <span className="text-sm text-secondary-light">
                                {student.email}
                              </span>
                            </div>
                          </td>

                          <td className="fw-medium">
                            {course.courseTitle}
                          </td>

                          <td className="text-center fw-medium">
                            {attendancePercent}%
                          </td>

                          <td className="text-center fw-medium">
                            {student.attendance.present} /{" "}
                            {student.attendance.total}
                          </td>

                          <td className="text-center fw-medium">
                            {student.scores.percentage}%
                          </td>

                          <td className="text-center fw-medium">
                            {perf.label}
                          </td>

                          <td className="text-center">
                            <span
                              className={`bg-${perf.color}-focus text-${perf.color}-main px-20 py-4 rounded-pill fw-medium text-sm`}
                            >
                              {perf.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMonthlyProgress;
