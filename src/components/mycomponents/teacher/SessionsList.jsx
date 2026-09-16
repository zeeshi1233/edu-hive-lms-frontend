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
import { getClassroomPath, getLiveKitRoomName } from "../../../utils/livekitRoom";
import LmsAsyncState from "../../common/LmsAsyncState";
import LmsLoader from "../../common/LmsLoader";
import LmsFilterBar from "../../common/LmsFilterBar";

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
  const [joiningId, setJoiningId] = useState("");
  const [cancellingId, setCancellingId] = useState("");

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

  const courseLabelOf = (s) =>
    courseDisplayName(s.course) || s.courseTitle || s.title || "";

  const statusLabel = (session) => {
    const raw = String(session.status || "").toLowerCase();
    if (raw === "conducted" || raw === "completed") return "Conducted";
    if (raw === "not_conducted" || raw === "not conducted") return "Not Conducted";
    if (raw === "cancelled") return "Cancelled";
    if (raw === "ongoing") return "Ongoing";
    return "Scheduled";
  };

  const courseOptions = useMemo(() => {
    const fromApi = toCourseSelectOptions(courses).map((o) => o.label);
    const fromSessions = sessions
      .map(courseLabelOf)
      .filter((label) => hasValidCourseLabel(label));
    return Array.from(new Set([...fromApi, ...fromSessions]));
  }, [courses, sessions]);

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
        const label = courseLabelOf(s).toLowerCase();
        if (!label.includes(selectedCourse.toLowerCase())) return false;
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
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel session");
    } finally {
      setCancellingId("");
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

                {!isCancelled && (
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
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
