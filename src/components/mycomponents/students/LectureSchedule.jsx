import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";

const LectureSchedule = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  /* ================= FETCH SESSIONS FROM API ================= */
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axiosInstance.get("/api/student/students-sessions");
        const sessions = res.data?.sessions || [];

        const formatted = sessions.map((s) => ({
          _id: s._id,
          title: s.title,
          subject: s.course?.title ?? "N/A",
          code: s.course?._id?.slice(-5) ?? "----",
          teacher: s.instructor?.name ?? "TBA",
          time: `${new Date(s.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(s.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          status: s.status === "pending" || s.status === "Scheduled" ? "Upcoming" : s.status,
          statusColor:
            s.status === "pending" || s.status === "Scheduled"
              ? "info"
              : s.status === "conducted" || s.status === "completed"
              ? "secondary"
              : s.isLive
              ? "success"
              : "success",
          canJoin: s.canStudentJoin || s.isLive,
          classroomPath: s.classroomPath,
          roomName: s.roomName,
          initials: s.course?.title?.substring(0, 2).toUpperCase() || "CS",
          initialsBg: "primary",
        }));

        setLectures(formatted);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <p style={{ color: isDark ? "#E2E8F0" : "#111" }}>Loading sessions...</p>;

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex flex-wrap align-items-center gap-1 justify-content-between mb-16">
            <h5 className="fw-bold mb-0">Today’s Lecture Schedule</h5>
          </div>

          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Teacher</th>
                  <th scope="col">Time</th>
                  <th scope="col" className="text-center">Status</th>
                  <th scope="col" className="text-center">Join</th>
                </tr>
              </thead>

              <tbody>
                {lectures.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No sessions scheduled for today.
                    </td>
                  </tr>
                ) : (
                  lectures.map((lec, i) => (
                    <tr key={i}>
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
                        {lec._id && lec.canJoin ? (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: "#FEBA01", color: "#000" }}
                            onClick={() =>
                              navigate(getClassroomPath(lec), {
                                state: {
                                  roomName: getLiveKitRoomName(lec),
                                  classTitle: lec.title || lec.subject,
                                },
                              })
                            }
                          >
                            Join Class
                          </button>
                        ) : lec._id ? (
                          <span style={{ color: "#888" }}>Waiting for teacher</span>
                        ) : (
                          <span style={{ color: "#888" }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureSchedule;
