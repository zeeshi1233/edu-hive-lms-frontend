import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AppContext";
import {
  courseDisplayName,
  extractList,
  getTeacherName,
  hasValidCourseLabel,
  toCourseSelectOptions,
} from "../../../utils/lmsData";
import { getClassroomPath } from "../../../utils/livekitRoom";
import LmsAsyncState from "../../common/LmsAsyncState";
import LmsLoader from "../../common/LmsLoader";
import LmsFilterBar from "../../common/LmsFilterBar";
import notify from "../../../utils/notify";

const NOT_CONDUCTED_REASONS = [
  "Teacher Not Present",
  "Student Not Present",
  "Others",
];

const dayStart = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const SessionsList = ({ viewAll }) => {
  const { role } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [statusValue, setStatusValue] = useState("conducted");
  const [typeValue, setTypeValue] = useState("Regular Class");
  const [reasonValue, setReasonValue] = useState("Others");
  const [saving, setSaving] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [syncingId, setSyncingId] = useState("");
  const [detailSession, setDetailSession] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const canEditStatus = role === "admin";
  const showFilters = !viewAll;

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

      if (role === "admin") {
        try {
          const courseRes = await axiosInstance.get("/api/admin/courses");
          setCourses(extractList(courseRes, ["courses", "data"]));
        } catch {
          setCourses([]);
        }
      } else if (role === "teacher") {
        try {
          const courseRes = await axiosInstance.get("/api/teacher/courses");
          setCourses(extractList(courseRes, ["courses", "data"]));
        } catch {
          setCourses([]);
        }
      }
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

  const isSessionEndedOrExpired = (session) => {
    if (!session) return false;
    const raw = String(session.status || "").toLowerCase();
    if (["conducted", "completed", "not_conducted", "not conducted", "cancelled"].includes(raw)) {
      return true;
    }
    if (session.teacherAttendance?.checkOutTime) {
      return true;
    }
    if (session.startTime) {
      const startMs = new Date(session.startTime).getTime();
      if (!isNaN(startMs)) {
        const durMins = parseInt(session.duration, 10) || 60;
        const endMs = session.endTime ? new Date(session.endTime).getTime() : startMs + durMins * 60000;
        if (Date.now() > endMs) return true;
      }
    }
    return false;
  };

  const formatDurationBetween = (start, end) => {
    if (!start || !end) return "—";
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return "—";
    const mins = Math.max(1, Math.round((endMs - startMs) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h} hr${h > 1 ? "s" : ""} ${m} mins` : `${m} mins`;
  };

  const courseLabelOf = (s) =>
    courseDisplayName(s.course) || s.courseTitle || s.title || "";

  const statusLabel = (session) => {
    const raw = String(session.status || "").toLowerCase();
    if (raw === "conducted" || raw === "completed") return "Conducted";
    if (raw === "not_conducted" || raw === "not conducted") return "Not Conducted";
    if (raw === "cancelled") return "Cancelled";
    if (session.teacherAttendance?.checkOutTime) return "Conducted";
    if (raw === "ongoing") {
      if (session.startTime) {
        const startMs = new Date(session.startTime).getTime();
        const durMins = parseInt(session.duration, 10) || 60;
        const endMs = session.endTime ? new Date(session.endTime).getTime() : startMs + durMins * 60000;
        if (Date.now() > endMs) return "Conducted";
      }
      return "Ongoing";
    }
    return "Scheduled";
  };

  const courseOptions = useMemo(
    () => toCourseSelectOptions(courses).map((o) => o.label),
    [courses]
  );

  const filteredSessions = useMemo(() => {
    if (viewAll) return sessions.slice(0, 6);

    const start = dayStart(startDate);
    const end = dayStart(endDate);
    const q = searchQuery.trim().toLowerCase();

    return sessions.filter((s) => {
      const sessionDay = dayStart(s.startTime || s.date);
      if (start && sessionDay && sessionDay < start) return false;
      if (end && sessionDay && sessionDay > end) return false;

      if (selectedCourse) {
        // Match real course name only — never fall back to session title (e.g. "testing1")
        const realCourse =
          courseDisplayName(s.course) ||
          s.courseTitle ||
          (typeof s.course === "string" && hasValidCourseLabel(s.course) ? s.course : "");
        if (!String(realCourse).toLowerCase().includes(selectedCourse.toLowerCase())) {
          return false;
        }
      }

      if (selectedStatus) {
        const label = statusLabel(s);
        if (selectedStatus === "conducted" && label !== "Conducted") return false;
        if (selectedStatus === "not_conducted" && label !== "Not Conducted") return false;
      }

      if (selectedType) {
        const type = String(s.type || "Regular Class");
        if (type.toLowerCase() !== selectedType.toLowerCase()) return false;
      }

      if (q) {
        const haystack = [
          s.title,
          courseLabelOf(s),
          getTeacherName(s.instructor) || getTeacherName(s.teacher),
          s.notConductedReason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    sessions,
    viewAll,
    startDate,
    endDate,
    selectedCourse,
    selectedStatus,
    selectedType,
    searchQuery,
  ]);

  const openEdit = (session) => {
    const current = String(session.status || "").toLowerCase();
    if (current === "cancelled") {
      setStatusValue("conducted");
    } else {
      setStatusValue(current.includes("not") ? "not_conducted" : "conducted");
    }
    setTypeValue(
      String(session.type || "").toLowerCase().includes("extra")
        ? "Extra Class"
        : "Regular Class"
    );
    setReasonValue(session.notConductedReason || "Others");
    if (session.startTime) {
      const d = new Date(session.startTime);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        setEditDate(`${y}-${m}-${day}`);
        setEditTime(`${hh}:${mm}`);
      }
    } else {
      setEditDate("");
      setEditTime("");
    }
    setEditingSession(session);
  };

  const saveStatus = async () => {
    if (!editingSession) return;
    if (statusValue === "not_conducted" && !reasonValue) {
      notify.warning("Please select a reason for Not Conducted");
      return;
    }

    setSaving(true);
    let newStartIso;
    if (editDate && editTime) {
      const [y, m, d] = editDate.split("-").map(Number);
      const [hh, mm] = editTime.split(":").map(Number);
      const localDt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
      if (!isNaN(localDt.getTime())) {
        newStartIso = localDt.toISOString();
      }
    }

    const payload = {
      status: statusValue,
      type: typeValue,
      notConductedReason: statusValue === "not_conducted" ? reasonValue : "",
      ...(newStartIso ? { startTime: newStartIso, clientOffset: new Date().getTimezoneOffset() } : {}),
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
                ...(newStartIso ? { startTime: newStartIso } : {}),
              }
            : item
        )
      );
      setEditingSession(null);
      notify.success("Session updated successfully");
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to update session status");
    } finally {
      setSaving(false);
    }
  };

  const cancelSession = async (session) => {
    if (!canEditStatus) return;
    if (!window.confirm(`Cancel class "${session.title || courseLabelOf(session)}"?`)) {
      return;
    }
    setCancellingId(session._id);
    try {
      try {
        await axiosInstance.put(`/api/admin/sessions/${session._id}`, {
          status: "Cancelled",
        });
      } catch {
        await axiosInstance.patch(`/api/admin/sessions/${session._id}`, {
          status: "Cancelled",
        });
      }
      setSessions((prev) =>
        prev.map((item) =>
          item._id === session._id ? { ...item, status: "Cancelled" } : item
        )
      );
      notify.success("Class cancelled");
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to cancel session");
    } finally {
      setCancellingId("");
    }
  };

  const syncAttendance = async (session) => {
    if (!canEditStatus) return;
    setSyncingId(session._id);
    try {
      const res = await axiosInstance.post(`/api/classroom/${session._id}/sync-attendance`);
      notify.success(res.data.message || "Attendance synced successfully!");
      getSessions();
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to sync attendance");
    } finally {
      setSyncingId("");
    }
  };

  const openDetail = async (session) => {
    setDetailLoading(true);
    setDetailSession({ ...session, _loading: true });
    try {
      const res = await axiosInstance.get(`/api/admin/sessions/${session._id}`);
      setDetailSession(res.data.session || res.data);
    } catch (e) {
      setDetailSession({ ...session, _error: e.response?.data?.message || "Failed to load details" });
    } finally {
      setDetailLoading(false);
    }
  };

  const badgeClass = (label) => {
    if (label === "Conducted") return "bg-success";
    if (label === "Not Conducted") return "bg-danger";
    if (label === "Cancelled") return "bg-danger-subtle text-danger border border-danger";
    if (label === "Ongoing") return "bg-success";
    return "bg-warning text-dark";
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

      {showFilters && (
        <div className="mt-3">
          <LmsFilterBar
            title="Sessions Filtration"
            courseLabel="Course / Subject"
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            courses={courseOptions}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            statusOptions={[
              { label: "Conducted", value: "conducted" },
              { label: "Not Conducted", value: "not_conducted" },
            ]}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onReset={() => setSelectedType("")}
            extraFilters={
              <div className="col-lg-2 col-md-6 col-12">
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Class Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="form-select"
                  style={{ borderRadius: "10px", fontSize: "13px" }}
                >
                  <option value="">All Types</option>
                  <option value="Regular Class">Regular Class</option>
                  <option value="Extra Class">Extra Class</option>
                </select>
              </div>
            }
          />
        </div>
      )}

      <div className="mt-3">
        <LmsAsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && filteredSessions.length === 0}
          loadingLabel="Loading sessions..."
          emptyTitle="No sessions found"
          emptyMessage={
            showFilters
              ? "No sessions match the selected filters."
              : "Schedule new classes from the Class Calendar."
          }
          emptyIcon="solar:calendar-bold-duotone"
          onRetry={getSessions}
          minHeight={140}
        >
          {filteredSessions.map((s) => {
            const label = statusLabel(s);
            const courseLabel = courseLabelOf(s) || "Course";
            const isCancelled = label === "Cancelled";
            const isNotConducted = label === "Not Conducted";

            return (
              <div
                key={s._id}
                className="d-flex flex-wrap align-items-center mb-3 p-3 rounded-3 gap-2"
                style={{
                  background: isCancelled
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(148, 163, 184, 0.08)",
                  border: isCancelled ? "1px solid rgba(239, 68, 68, 0.25)" : "none",
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-light me-1"
                  style={{ width: 50, height: 50, flexShrink: 0 }}
                >
                  <Icon icon="mdi:account" width={28} />
                </div>

                <div className="flex-grow-1" style={{ minWidth: 180 }}>
                  <h6 className="mb-0 fw-bold">
                    {getTeacherName(s.instructor) ||
                      getTeacherName(s.teacher) ||
                      "Unknown Instructor"}
                  </h6>
                  <small className="text-muted">
                    {courseLabel} · {s.type || "Regular Class"} · {formatTime(s.startTime)}{" "}
                    {s.startTime ? `· ${formatDate(s.startTime)}` : ""}
                  </small>
                  {isNotConducted && s.notConductedReason ? (
                    <div className="mt-1">
                      <span
                        className="badge"
                        style={{
                          background: "rgba(245, 158, 11, 0.18)",
                          color: "#B45309",
                          fontWeight: 600,
                        }}
                      >
                        Reason: {s.notConductedReason}
                      </span>
                    </div>
                  ) : null}
                </div>

                <span className={`badge me-1 ${badgeClass(label)}`}>{label}</span>

                {/* View Detail button — always visible */}
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                  style={{ background: "#F0FDF4", color: "#16a34a", borderRadius: "8px" }}
                  onClick={() => openDetail(s)}
                >
                  <Icon icon="mdi:eye-outline" width="16" />
                  Detail
                </button>

                {!isCancelled && (
                  label === "Conducted" || Boolean(s.teacherAttendance?.checkOutTime) || isSessionEndedOrExpired(s) ? (
                    <span
                      className="badge text-muted d-flex align-items-center"
                      style={{
                        background: "#F1F5F9",
                        fontSize: "12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      Class Ended
                    </span>
                  ) : role === "student" && (!s.teacher && !s.instructor && !s.teacherId) ? (
                    <span
                      className="badge text-muted d-flex align-items-center"
                      style={{
                        background: "#F1F5F9",
                        fontSize: "12px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      No Teacher Assigned
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                      style={{ background: "#FEBA01", color: "#000", borderRadius: "8px" }}
                      disabled={joiningId === s._id}
                      onClick={() => {
                        setJoiningId(s._id);
                        navigate(getClassroomPath(s), {
                          state: {
                            roomName: s.roomName || "",
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
                  )
                )}

                {!viewAll && canEditStatus && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                      style={{ background: "#0EA5E9", color: "#fff", borderRadius: "8px" }}
                      onClick={() => openEdit(s)}
                    >
                      <Icon icon="solar:pen-bold" width="16" />
                      Edit
                    </button>
                    {!isCancelled && (
                      <button
                        type="button"
                        className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                        style={{
                          background: "#FEE2E2",
                          color: "#B91C1C",
                          borderRadius: "8px",
                        }}
                        disabled={cancellingId === s._id}
                        onClick={() => cancelSession(s)}
                      >
                        {cancellingId === s._id ? (
                          <LmsLoader variant="button" label="Cancelling..." />
                        ) : (
                          <>
                            <Icon icon="solar:close-circle-bold" width="16" />
                            Cancel Class
                          </>
                        )}
                      </button>
                    )}
                    
                    {!isCancelled && (
                      <button
                        type="button"
                        className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
                        style={{
                          background: "#E0E7FF",
                          color: "#4338CA",
                          borderRadius: "8px",
                        }}
                        disabled={syncingId === s._id}
                        onClick={() => syncAttendance(s)}
                        title="Sync Google Meet Attendance"
                      >
                        {syncingId === s._id ? (
                          <LmsLoader variant="button" label="Syncing..." />
                        ) : (
                          <>
                            <Icon icon="mdi:sync" width="16" />
                            Sync
                          </>
                        )}
                      </button>
                    )}
                  </>
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
                      { value: "Cancelled", label: "Cancelled" },
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

                  {canEditStatus && (
                    <div className="mt-3 p-3 rounded-3" style={{ background: "#fffdf7", border: "1.5px solid #fde68a" }}>
                      <label className="fw-semibold mb-2 d-block text-xs" style={{ color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Scheduled Date & Time
                      </label>
                      <div className="row g-2">
                        <div className="col-7">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </div>
                        <div className="col-5">
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                          />
                        </div>
                      </div>
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

      {/* ══════════════ SESSION DETAIL MODAL ══════════════ */}
      {detailSession && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1040 }}
            onClick={() => setDetailSession(null)}
          />
          <div className="modal fade show" style={{ display: "block", zIndex: 1050, overflowY: "auto" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content" style={{ borderRadius: 16, border: "none", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

                {/* Header — Gold theme */}
                <div
                  className="modal-header"
                  style={{
                    background: "linear-gradient(135deg,#FEBA01 0%,#f5a800 100%)",
                    borderRadius: "16px 16px 0 0",
                    border: "none",
                    padding: "20px 24px",
                  }}
                >
                  <div>
                    <h5 className="modal-title fw-bold mb-1" style={{ color: "#0f172a", fontSize: 18 }}>
                      {detailSession.title || courseDisplayName(detailSession.course) || "Session Detail"}
                    </h5>
                    <small style={{ color: "rgba(0,0,0,0.5)", fontSize: 12 }}>
                      {detailSession.type || "Regular Class"} · {detailSession.duration || "60 mins"}
                    </small>
                  </div>
                  <button
                    className="btn-close"
                    style={{ filter: "brightness(0)" }}
                    onClick={() => setDetailSession(null)}
                  />
                </div>

                <div className="modal-body p-4">
                  {detailSession._loading || detailLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" style={{ color: "#FEBA01" }} />
                      <p className="mt-3 text-muted">Loading attendance data…</p>
                    </div>
                  ) : detailSession._error ? (
                    <div className="alert alert-danger">{detailSession._error}</div>
                  ) : (
                    <>
                      {/* ── Basic Info ── */}
                      <div className="row g-3 mb-4">
                        {[
                          { label: "Course", value: detailSession.course?.title || courseDisplayName(detailSession.course) || "—" },
                          { label: "Instructor (Host)", value: detailSession.instructor?.name || getTeacherName(detailSession.instructor) || "—" },
                          { label: "Date", value: detailSession.startTime ? new Date(detailSession.startTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                          { label: "Scheduled Time", value: detailSession.startTime ? new Date(detailSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "—" },
                          { label: "Duration", value: detailSession.duration || "60 mins" },
                          { label: "Status", value: detailSession.status || "Scheduled" },
                        ].map(({ label, value }) => (
                          <div className="col-6 col-md-4" key={label}>
                            <div className="p-3 rounded-3" style={{ background: "#fffdf7", border: "1.5px solid #fde68a" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#92400e" }}>{label}</div>
                              <div className="fw-bold mt-1" style={{ fontSize: 14, color: "#0f172a" }}>{value}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Teacher Attendance ── */}
                      {(() => {
                        const isEnded = isSessionEndedOrExpired(detailSession);
                        return (
                          <>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                              <Icon icon="mdi:account-tie" width={18} color="#2563eb" />
                              Teacher Attendance
                            </h6>
                            <div
                              className="p-3 rounded-3 mb-4"
                              style={{ background: "linear-gradient(135deg,#fffdf7,#fef9c3)", border: "1.5px solid #fde68a" }}
                            >
                              {detailSession.teacherAttendance?.checkInTime ? (
                                <div className="row g-3">
                                  <div className="col-6 col-md-3">
                                    <div className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Check-In</div>
                                    <div className="fw-bold" style={{ fontSize: 13 }}>
                                      {new Date(detailSession.teacherAttendance.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                  </div>
                                  <div className="col-6 col-md-3">
                                    <div className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Check-Out</div>
                                    <div className="fw-bold" style={{ fontSize: 13 }}>
                                      {detailSession.teacherAttendance.checkOutTime ? (
                                        new Date(detailSession.teacherAttendance.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      ) : isEnded ? (
                                        <span className="badge bg-secondary">Session Ended</span>
                                      ) : (
                                        <span className="badge bg-success">Still in Class</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-6 col-md-3">
                                    <div className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Duration</div>
                                    <div className="fw-bold" style={{ fontSize: 13 }}>
                                      {detailSession.teacherDuration || (isEnded && detailSession.teacherAttendance?.checkInTime ? formatDurationBetween(detailSession.teacherAttendance.checkInTime, detailSession.teacherAttendance?.checkOutTime || detailSession.endTime || (detailSession.startTime ? new Date(new Date(detailSession.startTime).getTime() + (parseInt(detailSession.duration, 10) || 60) * 60000) : null)) : "—")}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted fst-italic">Teacher has not checked in yet.</span>
                              )}
                            </div>

                            {/* ── Student Attendance ── */}
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                              <Icon icon="mdi:account-group" width={18} color="#FEBA01" />
                              Student Attendance
                              <span className="badge bg-success ms-1">
                                {detailSession.presentCount || 0} / {detailSession.totalStudents || (detailSession.studentAttendance?.length || 0)} Present
                              </span>
                            </h6>

                            {!detailSession.studentAttendance?.length ? (
                              <div className="text-center py-4 text-muted fst-italic">
                                <Icon icon="mdi:account-off-outline" width={32} className="mb-2" />
                                <p>No students have joined this session yet.</p>
                              </div>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-sm table-hover align-middle" style={{ fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ background: "#f1f5f9" }}>
                                      <th className="fw-bold">#</th>
                                      <th className="fw-bold">Student</th>
                                      <th className="fw-bold">Check-In</th>
                                      <th className="fw-bold">Check-Out</th>
                                      <th className="fw-bold">Duration</th>
                                      <th className="fw-bold">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detailSession.studentAttendance.map((rec, idx) => {
                                      const effectiveStudentLeftAt =
                                        rec.leftAt ||
                                        (isEnded ? (detailSession.teacherAttendance?.checkOutTime || detailSession.endTime || (detailSession.startTime ? new Date(new Date(detailSession.startTime).getTime() + (parseInt(detailSession.duration, 10) || 60) * 60000) : null)) : null);

                                      return (
                                        <tr key={rec._id || idx}>
                                          <td className="text-muted">{idx + 1}</td>
                                          <td>
                                            <div className="d-flex align-items-center gap-2">
                                              <div
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: 32, height: 32, background: "#eff6ff", flexShrink: 0 }}
                                              >
                                                <Icon icon="mdi:account" width={18} color="#2563eb" />
                                              </div>
                                              <span className="fw-semibold">{rec.student?.name || "Student"}</span>
                                            </div>
                                          </td>
                                          <td>
                                            {rec.joinedAt
                                              ? new Date(rec.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                              : <span className="text-muted">—</span>}
                                          </td>
                                          <td>
                                            {rec.leftAt ? (
                                              new Date(rec.leftAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                            ) : rec.present ? (
                                              isEnded ? (
                                                detailSession.teacherAttendance?.checkOutTime ? (
                                                  new Date(detailSession.teacherAttendance.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                ) : detailSession.endTime && !isNaN(new Date(detailSession.endTime).getTime()) ? (
                                                  new Date(detailSession.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                ) : (
                                                  <span className="badge bg-secondary" style={{ fontSize: 10 }}>Session Ended</span>
                                                )
                                              ) : (
                                                <span className="badge bg-success" style={{ fontSize: 10 }}>Still in Class</span>
                                              )
                                            ) : (
                                              <span className="text-muted">—</span>
                                            )}
                                          </td>
                                          <td>
                                            {rec.duration
                                              ? rec.duration
                                              : rec.joinedAt
                                              ? isEnded
                                                ? formatDurationBetween(rec.joinedAt, effectiveStudentLeftAt)
                                                : !rec.leftAt
                                                ? "Ongoing"
                                                : "—"
                                              : "—"}
                                          </td>
                                          <td>
                                            {rec.present
                                              ? <span className="badge bg-success">Present</span>
                                              : <span className="badge bg-danger">Absent</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="lms-btn-ghost" onClick={() => setDetailSession(null)}>
                    Close
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
