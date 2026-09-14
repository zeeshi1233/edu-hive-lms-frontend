import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import LmsAsyncState from "../../components/common/LmsAsyncState";

const TeacherMonthlyProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProgress = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/api/teacher/get-students-progress");
      setProgressData(res.data.progressData || []);
    } catch (err) {
      console.error("Failed to load progress", err);
      setError(err.response?.data?.message || "Failed to load student progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProgress();
  }, []);

  const getPerformance = (percentage) => {
    if (percentage >= 85) return { label: "Excellent", color: "success", status: "Outstanding" };
    if (percentage >= 70) return { label: "Good", color: "primary", status: "On Track" };
    if (percentage >= 50) return { label: "Average", color: "warning", status: "Needs Improvement" };
    return { label: "Poor", color: "danger", status: "At Risk" };
  };

  const rows = progressData.flatMap((course) =>
    (course.students || []).map((student) => ({ course, student }))
  );

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex justify-content-between mb-16">
            <div>
              <h5 className="fw-bold mb-0">Monthly Student Progress</h5>
              <span className="text-sm text-secondary-light">January 2026</span>
            </div>
          </div>

          <LmsAsyncState
            loading={loading}
            error={error}
            empty={!loading && !error && rows.length === 0}
            loadingLabel="Loading student progress..."
            emptyTitle="No progress data"
            emptyMessage="No student progress records found yet."
            emptyIcon="solar:chart-bold-duotone"
            onRetry={getProgress}
            minHeight={180}
          >
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
                  {rows.map(({ course, student }) => {
                    const attendancePercent = Math.round(
                      (student.attendance.present / student.attendance.total) * 100
                    );
                    const perf = getPerformance(Number(student.scores.percentage));

                    return (
                      <tr key={`${course.courseTitle}-${student.studentId}`}>
                        <td>
                          <div>
                            <h6 className="text-md mb-0 fw-medium">{student.name}</h6>
                            <span className="text-sm text-secondary-light">{student.email}</span>
                          </div>
                        </td>
                        <td className="fw-medium">{course.courseTitle}</td>
                        <td className="text-center">{attendancePercent}%</td>
                        <td className="text-center">
                          {student.assignments?.submitted || 0}/{student.assignments?.total || 0}
                        </td>
                        <td className="text-center">{student.scores?.percentage || 0}%</td>
                        <td className="text-center">
                          <span className={`badge bg-${perf.color}`}>{perf.label}</span>
                        </td>
                        <td className="text-center">{perf.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </LmsAsyncState>
        </div>
      </div>
    </div>
  );
};

export default TeacherMonthlyProgress;
