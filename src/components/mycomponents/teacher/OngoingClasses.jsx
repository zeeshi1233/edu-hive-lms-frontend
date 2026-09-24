import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";
import LmsAsyncState from "../../common/LmsAsyncState";

const OngoingClasses = () => {
  const tableRef = useRef(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const navigate = useNavigate();

  const getSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/api/teacher/sessions");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load ongoing classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions();
  }, []);

  const ongoingSessions = sessions.filter((s) => {
    const rawStatus = String(s.status || "").toLowerCase();
    if (["conducted", "completed", "not_conducted", "not conducted", "cancelled"].includes(rawStatus)) {
      return false;
    }
    if (s.teacherAttendance?.checkOutTime) {
      return false;
    }
    const start = new Date(s.startTime);
    if (isNaN(start.getTime())) return false;
    const today = new Date();
    const isToday =
      start.getFullYear() === today.getFullYear() &&
      start.getMonth() === today.getMonth() &&
      start.getDate() === today.getDate();
    if (!isToday) return false;

    const durMins = parseInt(s.duration, 10) || 60;
    const endMs = s.endTime ? new Date(s.endTime).getTime() : start.getTime() + durMins * 60000;
    if (Date.now() > endMs && rawStatus !== "ongoing") {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (!loading && ongoingSessions.length && tableRef.current) {
      const table = $(tableRef.current).DataTable();
      return () => table.destroy();
    }
  }, [loading, ongoingSessions]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="card basic-data-table">
      <div className="card-header">
        <h5 className="card-title mb-0">Ongoing Classes</h5>
      </div>

      <div className="card-body">
        <LmsAsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && ongoingSessions.length === 0}
          loadingLabel="Loading ongoing classes..."
          emptyTitle="No ongoing classes"
          emptyMessage="No ongoing classes right now."
          emptyIcon="solar:videocamera-record-bold-duotone"
          onRetry={getSessions}
          minHeight={160}
        >
          <table className="table bordered-table mb-0" ref={tableRef}>
            <thead>
              <tr>
                <th>S.L</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Class Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {ongoingSessions.map((cls, i) => (
                <tr key={cls._id}>
                  <td>{i + 1}</td>
                  <td>{cls.instructor?.name}</td>
                  <td>{cls.course?.title || "—"}</td>
                  <td>
                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  </td>
                  <td>
                    <span className={`badge ${cls.isLive || String(cls.status || "").toLowerCase() === "ongoing" ? "bg-success" : "bg-warning text-dark"} px-3 py-2`}>
                      {cls.isLive || String(cls.status || "").toLowerCase() === "ongoing" ? "Live" : "Scheduled"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn d-flex align-items-center justify-content-center"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "8px",
                        background: "#FEBA01",
                      }}
                      disabled={joiningId === cls._id}
                      onClick={() => {
                        setJoiningId(cls._id);
                        navigate(getClassroomPath(cls), {
                          state: {
                            roomName: getLiveKitRoomName(cls),
                            classTitle: cls.course?.title || cls.title || "Live Class",
                          },
                        });
                      }}
                    >
                      {joiningId === cls._id ? (
                        <span className="lms-spinner lms-spinner-sm" />
                      ) : (
                        <Icon icon="mdi:video" width={22} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LmsAsyncState>
      </div>
    </div>
  );
};

export default OngoingClasses;
