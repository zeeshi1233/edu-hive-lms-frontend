import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";
import LmsAsyncState from "../../common/LmsAsyncState";
import LmsLoader from "../../common/LmsLoader";

const LectureSchedule = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const navigate = useNavigate();

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/api/student/students-sessions");
      const sessions = res.data?.sessions || [];

      const formatted = sessions.map((s) => ({
        _id: s._id,
        title: s.title,
        subject: s.course?.title ?? "N/A",
        code: s.course?._id?.slice(-5) ?? "----",
        teacher: s.teacher?.name ?? s.instructor?.name ?? "TBA",
        hasTeacher: Boolean(
          (s.teacher?.name || s.instructor?.name) &&
          (s.teacher?.name !== "TBA" && s.instructor?.name !== "TBA") &&
          (s.teacherId || s.teacher?._id || s.instructor?._id)
        ),
        time: `${new Date(s.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(s.endTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        status: s.status === "pending" ? "Upcoming" : s.status,
        statusColor:
          s.status === "pending"
            ? "info"
            : s.status === "completed"
            ? "secondary"
            : "success",
        meetingLink: s.meetingLink,
        initials: s.course?.title?.substring(0, 2).toUpperCase() || "CS",
        initialsBg: "primary",
      }));

      setLectures(formatted);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError(err.response?.data?.message || "Failed to load lecture schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex flex-wrap align-items-center gap-1 justify-content-between mb-16">
            <h5 className="fw-bold mb-0" style={{ color: isDark ? "#E2E8F0" : undefined }}>
              Today’s Lecture Schedule
            </h5>
          </div>

          <LmsAsyncState
            loading={loading}
            error={error}
            empty={!loading && !error && lectures.length === 0}
            loadingLabel="Loading today's lectures..."
            emptyTitle="No sessions today"
            emptyMessage="No sessions scheduled for today."
            emptyIcon="solar:calendar-bold-duotone"
            onRetry={fetchSessions}
            minHeight={160}
          >
            <div className="table-responsive scroll-sm">
              <table className="table bordered-table sm-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Subject</th>
                    <th scope="col">Teacher</th>
                    <th scope="col">Time</th>
                    <th scope="col" className="text-center">
                      Status
                    </th>
                    <th scope="col" className="text-center">
                      Join
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lectures.map((lec, i) => (
                    <tr key={lec._id || i}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className={`w-40-px h-40-px bg-${lec.initialsBg}-100 text-${lec.initialsBg}-600 rounded-circle d-flex justify-content-center align-items-center me-12`}
                          >
                            <span className="fw-bold">{lec.initials}</span>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="text-md mb-0 fw-medium">{lec.subject}</h6>
                            <span className="text-sm text-secondary-light fw-medium">
                              {lec.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{lec.teacher}</td>
                      <td>{lec.time}</td>
                      <td className="text-center">
                        <span
                          className={`bg-${lec.statusColor}-focus text-${lec.statusColor}-main px-24 py-4 rounded-pill fw-medium text-sm`}
                        >
                          {lec.status}
                        </span>
                      </td>
                      <td className="text-center">
                        {lec.hasTeacher && lec._id ? (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: "#FEBA01", color: "#000", fontWeight: "600" }}
                            disabled={joiningId === lec._id}
                            onClick={() => {
                              setJoiningId(lec._id);
                              navigate(getClassroomPath(lec), {
                                state: {
                                  roomName: getLiveKitRoomName(lec),
                                  classTitle: lec.title || lec.subject,
                                },
                              });
                            }}
                          >
                            {joiningId === lec._id ? (
                              <LmsLoader variant="button" label="Joining..." />
                            ) : (
                              "Join Class"
                            )}
                          </button>
                        ) : (
                          <span
                            className="badge text-muted"
                            style={{
                              background: isDark ? "#334155" : "#F1F5F9",
                              fontSize: "12px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                            }}
                          >
                            No Teacher Assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LmsAsyncState>
        </div>
      </div>
    </div>
  );
};

export default LectureSchedule;
