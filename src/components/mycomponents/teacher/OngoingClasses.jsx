import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";


const OngoingClasses = () => {
  const tableRef = useRef(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= GET SESSIONS ================= */
  const getSessions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/teacher/sessions");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions();
  }, []);

  /* ================= FILTER ONGOING (TODAY + TIME) ================= */
  
// Filter today's sessions (local time)
const ongoingSessions = sessions.filter((s) => {
  const start = new Date(s.startTime); // UTC time from API
  const today = new Date(); // local time

  // convert start to local date components
  return (
    start.getFullYear() === today.getFullYear() &&
    start.getMonth() === today.getMonth() &&
    start.getDate() === today.getDate()
  );
});



  /* ================= DATATABLE ================= */
  useEffect(() => {
    if (ongoingSessions.length && tableRef.current) {
      const table = $(tableRef.current).DataTable();
      return () => table.destroy();
    }
  }, [ongoingSessions]);

  /* ================= TIME FORMAT ================= */
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
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : ongoingSessions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No ongoing classes right now
                </td>
              </tr>
            ) : (
              ongoingSessions.map((cls, i) => (
                <tr key={cls._id}>
                  <td>{i + 1}</td>
                  <td>{cls.instructor?.name}</td>
                  <td>{cls.course?.title || "—"}</td>
                  <td>
                    {formatTime(cls.startTime)} -{" "}
                    {formatTime(cls.endTime)}
                  </td>
                  <td>
                    <span className="badge bg-success px-3 py-2">
                      Live
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
                      onClick={() =>
                        navigate(getClassroomPath(cls), {
                          state: {
                            roomName: getLiveKitRoomName(cls),
                            classTitle: cls.course?.title || cls.title || "Live Class",
                          },
                        })
                      }
                    >
                      <Icon icon="mdi:video" width={22} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OngoingClasses;
