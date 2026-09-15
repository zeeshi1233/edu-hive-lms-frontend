import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AppContext";
import { courseDisplayName, extractList, getTeacherName } from "../../../utils/lmsData";
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";
import LmsAsyncState from "../../common/LmsAsyncState";
import LmsLoader from "../../common/LmsLoader";

const NOT_CONDUCTED_REASONS = [
  "Teacher Not Present",
  "Student Not Present",
  "Others",
];

const SessionsList = ({ viewAll }) => {
  const { role } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [statusValue, setStatusValue] = useState("conducted");
  const [typeValue, setTypeValue] = useState("Regular Class");
  const [reasonValue, setReasonValue] = useState("Others");
  const [saving, setSaving] = useState(false);
  const [joiningId, setJoiningId] = useState("");
  const navigate = useNavigate();
  const canEditStatus = role === "admin";

  const getSessionsUrl = () => {
    if (role === "admin") return "/api/admin/sessions";
    if (role === "teacher") return "/api/teacher/sessions";
    if (role === "student") return "/api/student/students-sessions";
    return "/api/sessions";
  };

  const getSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(getSessionsUrl());
      setSessions(extractList(res, ["sessions", "data"]));
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setError(err.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    getSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const openEdit = (session) => {
    const current = String(session.status || "").toLowerCase();
    setStatusValue(current.includes("not") ? "not_conducted" : "conducted");
    setTypeValue(
      String(session.type || "").toLowerCase().includes("extra")
        ? "Extra Class"
        : "Regular Class"
    );
    setReasonValue(session.notConductedReason || "Others");
    setEditingSession(session);
  };

  const saveStatus = async () => {
    if (!editingSession) return;
    if (statusValue === "not_conducted" && !reasonValue) {
      alert("Please select a reason for Not Conducted");
      return;
    }

    setSaving(true);
    const payload = {
      status: statusValue,
      type: typeValue,
      notConductedReason: statusValue === "not_conducted" ? reasonValue : "",
    };

    try {
      try {
        await axiosInstance.put(`/api/admin/sessions/${editingSession._id}`, payload);
      } catch {
        await axiosInstance.patch(`/api/admin/sessions/${editingSession._id}`, payload);
      }
      setSessions((prev) =>
        prev.map((item) =>
          item._id === editingSession._id
            ? {
                ...item,
                status: statusValue,
                type: typeValue,
                notConductedReason:
                  statusValue === "not_conducted" ? reasonValue : "",
              }
            : item
        )
      );
      setEditingSession(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update session status");
    } finally {
      setSaving(false);
    }
  };

  const visibleSessions = viewAll ? sessions.slice(0, 6) : sessions;

  const statusLabel = (session) => {
    const raw = String(session.status || "").toLowerCase();
    if (raw === "conducted" || raw === "completed") return "Conducted";
    if (raw === "not_conducted" || raw === "not conducted") return "Not Conducted";
    if (raw === "ongoing") return "Live";
    if (raw === "cancelled") return "Cancelled";
    if (session.endTime && new Date(session.endTime) < new Date()) return "Conducted";
    return "Upcoming";
  };

  return (
    <div className="card p-20 border-0 rounded-4 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center border-0 px-0">
        <div>
          <h5 className="fw-bold m-0">Sessions</h5>
          <small className="text-muted">
            {role === "teacher"
              ? "Sessions assigned to you"
              : role === "student"
              ? "Sessions from your enrolled courses"
              : "Schedule new classes from the Class Calendar"}
          </small>
        </div>
      </div>

      <div className="mt-3">
        <LmsAsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && sessions.length === 0}
          loadingLabel="Loading sessions..."
          emptyTitle="No sessions found"
          emptyMessage="Schedule new classes from the Class Calendar."
          emptyIcon="solar:calendar-bold-duotone"
          onRetry={getSessions}
          minHeight={140}
        >
          {visibleSessions.map((s) => {
            const label = statusLabel(s);
            const courseLabel = courseDisplayName(s.course) || s.courseTitle || s.title || "Course";
            return (
              <div
                key={s._id}
                className="d-flex align-items-center mb-3 p-3 rounded-3"
                style={{ background: "rgba(148, 163, 184, 0.08)" }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-light me-3"
                  style={{ width: 50, height: 50 }}
                >
                  <Icon icon="mdi:account" width={28} />
                </div>

                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-bold">
                    {getTeacherName(s.instructor) || getTeacherName(s.teacher) || "Unknown Instructor"}
                  </h6>
                  <small className="text-muted">
                    {courseLabel} · {s.type || "Regular Class"} · {formatTime(s.startTime)}{" "}
                    {s.startTime ? `· ${formatDate(s.startTime)}` : ""}
                  </small>
                </div>

                <span
                  className={`badge me-2 ${
                    label === "Conducted"
                      ? "bg-success"
                      : label === "Not Conducted"
                      ? "bg-danger"
                      : label === "Live"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {label}
                </span>

                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-1 fw-semibold me-2"
                  style={{ background: "#FEBA01", color: "#000", borderRadius: "8px" }}
                  disabled={joiningId === s._id}
                  onClick={() => {
                    setJoiningId(s._id);
                    navigate(getClassroomPath(s), {
                      state: {
                        roomName: getLiveKitRoomName(s),
                        classTitle: s.title || courseLabel,
                      },
                    });
                  }}
                >
                  {joiningId === s._id ? (
                    <LmsLoader variant="button" label="Joining..." />
                  ) : (
                    <>
                      <Icon icon="solar:videocamera-record-bold" width="16" />
                      Join Class
                    </>
                  )}
                </button>

                {!viewAll && canEditStatus && (
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                    style={{ background: "#FEBA01", color: "#000", borderRadius: "8px" }}
                    onClick={() => openEdit(s)}
                  >
                    <Icon icon="solar:pen-bold" width="16" />
                    Edit
                  </button>
                )}
              </div>
            );
          })}
        </LmsAsyncState>
      </div>

      {editingSession && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 1040,
            }}
            onClick={() => setEditingSession(null)}
          />
          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "14px" }}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Update Session Status</h5>
                  <button className="btn-close" onClick={() => setEditingSession(null)} />
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    {editingSession.title ||
                      courseDisplayName(editingSession.course) ||
                      "Session"}
                  </p>

                  <label className="fw-semibold mb-2 d-block">Class Type</label>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {["Regular Class", "Extra Class"].map((option) => (
                      <label
                        key={option}
                        className="d-flex align-items-center gap-2 p-3 rounded-3"
                        style={{
                          border: `1px solid ${
                            typeValue === option ? "#FEBA01" : "#E2E8F0"
                          }`,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="session-type"
                          checked={typeValue === option}
                          onChange={() => setTypeValue(option)}
                        />
                        <strong>{option}</strong>
                      </label>
                    ))}
                  </div>

                  <label className="fw-semibold mb-2 d-block">Status</label>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { value: "conducted", label: "Conducted" },
                      { value: "not_conducted", label: "Not Conducted" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="d-flex align-items-center gap-2 p-3 rounded-3"
                        style={{
                          border: `1px solid ${
                            statusValue === option.value ? "#FEBA01" : "#E2E8F0"
                          }`,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="session-status"
                          checked={statusValue === option.value}
                          onChange={() => setStatusValue(option.value)}
                        />
                        <strong>{option.label}</strong>
                      </label>
                    ))}
                  </div>

                  {statusValue === "not_conducted" && (
                    <div className="mt-3">
                      <label className="fw-semibold mb-2 d-block">
                        Reason (Not Conducted)
                      </label>
                      <select
                        className="form-select"
                        value={reasonValue}
                        onChange={(e) => setReasonValue(e.target.value)}
                        style={{ borderRadius: 10 }}
                      >
                        {NOT_CONDUCTED_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="lms-btn-ghost" onClick={() => setEditingSession(null)}>
                    Close
                  </button>
                  <button className="lms-btn-primary" onClick={saveStatus} disabled={saving}>
                    {saving ? <LmsLoader variant="button" label="Saving..." /> : "Save Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionsList;
