import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AppContext";
import axiosInstance from "../../api/axiosInstance";
import LmsFilterBar from "../../components/common/LmsFilterBar";
import SearchableSelect from "../../components/common/SearchableSelect";
import {
  extractList,
  getTeacherName,
  hasValidCourseLabel,
  mergeSessionLists,
  persistScheduledClasses,
  toCourseSelectOptions,
} from "../../utils/lmsData";
import { getClassroomPath, getLiveKitRoomName, getSessionId } from "../../utils/livekitRoom";
import LmsLoader from "../../components/common/LmsLoader";
import LmsAsyncState from "../../components/common/LmsAsyncState";

export default function ClassCalendar() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [joiningId, setJoiningId] = useState("");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // View mode: 'month' | 'week' | 'list'
  const [viewMode, setViewMode] = useState("month");

  // Selected date for calendar navigation (default today)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal States
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const emptySession = {
    title: "",
    course: "",
    courseId: "",
    instructor: user?.name || "",
    teacherId: user?._id || user?.id || "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    duration: "60 mins",
    type: "Regular Class",
    description: "",
  };

  const [newSession, setNewSession] = useState(emptySession);
  const [sessions, setSessions] = useState([]);

  const loadCalendarData = async () => {
    setLoading(true);
    setError("");

    try {
      // Role-scoped sessions only:
      // admin → all, teacher → assigned, student → enrolled courses
      let sessionsUrl = "/api/sessions";
      if (role === "admin") sessionsUrl = "/api/admin/sessions";
      else if (role === "teacher") sessionsUrl = "/api/teacher/sessions";
      else if (role === "student") sessionsUrl = "/api/student/students-sessions";

      const res = await axiosInstance.get(sessionsUrl);
      const list = extractList(res, ["sessions", "classes", "data"]);
      // Do NOT merge localStorage — that leaked other users' classes
      setSessions(mergeSessionLists(list));
      persistScheduledClasses([]);

      if (role === "admin") {
        try {
          const courseRes = await axiosInstance.get("/api/admin/courses");
          setCourses(extractList(courseRes, ["courses", "data"]));
        } catch (courseError) {
          console.error("Failed to fetch calendar courses", courseError);
        }

        try {
          const teacherRes = await axiosInstance.get("/api/admin/teachers");
          setTeachers(extractList(teacherRes, ["teachers", "data"]));
        } catch (teacherError) {
          console.error("Failed to fetch calendar instructors", teacherError);
        }
      } else if (role === "teacher") {
        try {
          const courseRes = await axiosInstance.get("/api/teacher/courses");
          setCourses(extractList(courseRes, ["courses", "data"]));
        } catch (courseError) {
          console.error("Failed to fetch teacher courses", courseError);
        }
      } else if (role === "student") {
        try {
          const courseRes = await axiosInstance.get("/api/student/courses");
          setCourses(extractList(courseRes, ["courses", "data"]));
        } catch (courseError) {
          console.error("Failed to fetch student courses", courseError);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load calendar");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    loadCalendarData();

    const onFocus = () => loadCalendarData();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadCalendarData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const matchesStatusFilter = (session, filter) => {
    if (!filter) return true;
    const raw = String(session.status || "").toLowerCase();
    const isLive = Boolean(session.isLive) || raw === "live" || raw === "ongoing";
    const isConducted = raw === "conducted" || raw === "completed";
    const isNotConducted = raw === "not conducted" || raw === "not_conducted";
    const isCancelled = raw === "cancelled";
    const isScheduled =
      raw === "scheduled" ||
      raw === "pending" ||
      (!isLive && !isConducted && !isNotConducted && !isCancelled);

    switch (filter) {
      case "Scheduled":
        return isScheduled || isLive;
      case "Completed":
        return isConducted || isNotConducted;
      case "Cancelled":
        return isCancelled;
      default:
        return raw === String(filter).toLowerCase();
    }
  };

  // Filter Logic
  const filteredSessions = sessions.filter((s) => {
    if (startDate && new Date(s.date) < new Date(startDate)) return false;
    if (endDate && new Date(s.date) > new Date(endDate)) return false;
    if (selectedCourse) {
      const courseMatch =
        s.course?.toLowerCase().includes(selectedCourse.toLowerCase()) ||
        String(s.courseId || "") === String(selectedCourse);
      if (!courseMatch) return false;
    }
    if (!matchesStatusFilter(s, selectedStatus)) return false;
    if (selectedType && s.type?.toLowerCase() !== selectedType.toLowerCase())
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchCourse = s.course?.toLowerCase().includes(q);
      const matchInstructor = s.instructor?.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse && !matchInstructor) return false;
    }
    return true;
  });

  const typeOptions = ["Regular Class", "Extra Class"];
  const courseSelectOptions = toCourseSelectOptions(courses);
  const teacherSelectOptions = teachers.map((teacher) => ({
    value: teacher._id || teacher.id,
    label: getTeacherName(teacher),
  }));

  // Unique list of courses for filter dropdown — never show Untitled Course
  const courseOptions = Array.from(
    new Map(
      [
        ...courseSelectOptions.map((option) => [option.label, option.label]),
        ...sessions
          .map((s) => s.course)
          .filter((label) => hasValidCourseLabel(label))
          .map((label) => [label, label]),
      ]
    ).values()
  );

  const statusOptions = [
    { label: "Scheduled", value: "Scheduled" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  // Helper for calendar month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const joinClass = (session) => {
    const id = getSessionId(session);
    if (!id) {
      alert("This class does not have a valid session id yet.");
      return;
    }
    setJoiningId(id);
    navigate(getClassroomPath(session), {
      state: {
        roomName: getLiveKitRoomName(session),
        classTitle: session.title || session.course || "Live Class",
      },
    });
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!newSession.title || !newSession.courseId || !newSession.teacherId) {
      alert("Please select a course and instructor before scheduling.");
      return;
    }

    const startTime = `${newSession.date}T${newSession.time}`;
    const created = {
      ...newSession,
      _id: "s_" + Date.now(),
      status: "Scheduled",
      attendees: 0,
      startTime,
    };

    setSaving(true);
    try {
      const payload = {
        title: newSession.title,
        courseId: newSession.courseId,
        teacherId: newSession.teacherId,
        topic: newSession.title,
        startTime,
        type: newSession.type,
        duration: newSession.duration,
        description: newSession.description,
      };
      const res = await axiosInstance.post("/api/admin/sessions", payload);
      const saved = res.data?.session || res.data?.data || res.data;
      if (saved && (saved._id || saved.id)) {
        created._id = saved._id || saved.id;
      }

      // Refresh from API so visibility stays server-authoritative
      await loadCalendarData();
      setShowAddModal(false);
      setNewSession(emptySession);
    } catch (err) {
      console.error("Failed to persist scheduled class", err);
      alert(err.response?.data?.message || "Failed to schedule class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "live":
      case "ongoing":
        return { bg: "#DCFCE7", text: "#15803D", label: "LIVE NOW" };
      case "scheduled":
      case "pending":
        return { bg: "#DBEAFE", text: "#1D4ED8", label: "Scheduled" };
      case "completed":
      case "conducted":
        return { bg: "#F1F5F9", text: "#475569", label: "Conducted" };
      case "not conducted":
      case "not_conducted":
        return { bg: "#FEF3C7", text: "#B45309", label: "Not Conducted" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#B91C1C", label: "Cancelled" };
      default:
        return { bg: "#FEF3C7", text: "#B45309", label: status };
    }
  };

  // Styles
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#1F2937";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const headerBg = isDark ? "#0F172A" : "#F8FAFC";
  const inputBg = isDark ? "#0F172A" : "#F8FAFC";

  return (
    <div
      style={{
        background: isDark ? "#0F172A" : "#F1F5F9",
        minHeight: "100vh",
        padding: "24px",
        color: textColor,
        transition: "all 0.3s ease",
      }}
    >
      {/* Top Banner & Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: textColor }}>
            Class Scheduled Calendar
          </h3>
          <p className="mb-0 text-sm" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
            View live class timelines, upcoming lectures, and schedule interactive sessions.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* View Mode Buttons */}
          <div
            className="p-1 d-flex gap-1"
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
            }}
          >
            {["month", "list"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="btn btn-sm text-capitalize"
                style={{
                  background: viewMode === mode ? "#FEBA01" : "transparent",
                  color: viewMode === mode ? "#000" : textColor,
                  fontWeight: viewMode === mode ? "700" : "500",
                  borderRadius: "8px",
                  border: "none",
                  padding: "6px 16px",
                  transition: "0.2s",
                }}
              >
                {mode === "month" ? "Grid Calendar" : "Schedule List"}
              </button>
            ))}
          </div>

          {role === "admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn d-flex align-items-center gap-2 fw-bold"
              style={{
                background: "#FEBA01",
                color: "#000",
                borderRadius: "12px",
                padding: "8px 18px",
                border: "none",
                boxShadow: "0 4px 12px rgba(254, 186, 1, 0.3)",
              }}
            >
              <Icon icon="solar:add-circle-bold" width="20" /> Schedule Class
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Calendar Filtration"
        courseLabel="Course"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        courses={courseOptions}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        extraFilters={
          <div className="col-lg-2 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: textColor,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Class Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Types</option>
              {typeOptions.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Main Calendar Card */}
      <div
        style={{
          position: "relative",
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "20px",
          padding: "24px",
          boxShadow: isDark
            ? "0 4px 25px rgba(0, 0, 0, 0.45)"
            : "0 4px 20px rgba(0, 0, 0, 0.05)",
          minHeight: 320,
        }}
      >
        <LmsAsyncState
          loading={loading}
          error={error}
          loadingLabel="Loading scheduled classes..."
          onRetry={loadCalendarData}
          loaderVariant="page"
          minHeight={280}
        >
        {/* Month Navigation */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <h4 className="fw-bold mb-0" style={{ color: textColor }}>
              {monthNames[month]} {year}
            </h4>
            <button
              onClick={handleToday}
              className="btn btn-sm"
              style={{
                background: isDark ? "#334155" : "#F1F5F9",
                color: textColor,
                borderRadius: "8px",
                fontWeight: "600",
                border: "none",
              }}
            >
              Today
            </button>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: headerBg,
                color: textColor,
              }}
            >
              <Icon icon="solar:alt-arrow-left-bold" width="18" />
            </button>
            <button
              onClick={handleNextMonth}
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: headerBg,
                color: textColor,
              }}
            >
              <Icon icon="solar:alt-arrow-right-bold" width="18" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Month Grid */}
        {viewMode === "month" && (
          <div>
            {/* Days Header */}
            <div
              className="row text-center fw-bold text-uppercase mb-2 g-0"
              style={{
                fontSize: "12px",
                color: isDark ? "#94A3B8" : "#64748B",
                borderBottom: `1px solid ${borderColor}`,
                paddingBottom: "10px",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="col">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="row g-2">
              {/* Empty padding cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="col"
                  style={{
                    flex: "0 0 14.285%",
                    maxWidth: "14.285%",
                    minHeight: "110px",
                    background: isDark ? "rgba(15, 23, 42, 0.4)" : "#F9FAFB",
                    borderRadius: "12px",
                    opacity: 0.4,
                  }}
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(
                  2,
                  "0"
                )}-${String(dayNum).padStart(2, "0")}`;

                const daySessions = filteredSessions.filter((s) => {
                  const sDate = new Date(s.date).toISOString().split("T")[0];
                  return sDate === formattedDate;
                });

                const isToday =
                  new Date().toDateString() ===
                  new Date(year, month, dayNum).toDateString();

                return (
                  <div
                    key={dayNum}
                    className="col"
                    style={{
                      flex: "0 0 14.285%",
                      maxWidth: "14.285%",
                      minHeight: "115px",
                      background: isToday
                        ? isDark
                          ? "rgba(254, 186, 1, 0.15)"
                          : "rgba(254, 186, 1, 0.1)"
                        : isDark
                        ? "#0F172A"
                        : "#FAFAFA",
                      border: isToday
                        ? "2px solid #FEBA01"
                        : `1px solid ${borderColor}`,
                      borderRadius: "12px",
                      padding: "8px",
                      transition: "0.2s ease",
                      overflowY: "auto",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        className="fw-bold text-xs"
                        style={{
                          color: isToday ? "#FEBA01" : textColor,
                          fontSize: "13px",
                        }}
                      >
                        {dayNum}
                      </span>
                      {daySessions.length > 0 && (
                        <span
                          className="badge rounded-pill"
                          style={{
                            background: "#FEBA01",
                            color: "#000",
                            fontSize: "10px",
                          }}
                        >
                          {daySessions.length} Class{daySessions.length > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>

                    {/* Classes on this day */}
                    <div className="d-flex flex-column gap-1">
                      {daySessions.map((sess) => {
                        const st = getStatusBadge(sess.status);
                        return (
                          <div
                            key={sess._id}
                            onClick={() => setSelectedSession(sess)}
                            style={{
                              background: st.bg,
                              color: st.text,
                              borderRadius: "6px",
                              padding: "4px 6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              borderLeft: `3px solid ${st.text}`,
                            }}
                            title={`${sess.title} - ${sess.time}`}
                          >
                            {sess.time} | {sess.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View Mode 2: List View */}
        {viewMode === "list" && (
          <div className="table-responsive">
            <table className="table align-middle" style={{ color: textColor }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                  <th>Date & Time</th>
                  <th>Course</th>
                  <th>Class Topic</th>
                  <th>Instructor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No classes found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((sess) => {
                    const st = getStatusBadge(sess.status);
                    return (
                      <tr
                        key={sess._id}
                        style={{ borderBottom: `1px solid ${borderColor}` }}
                      >
                        <td className="fw-semibold">
                          {sess.date}
                          <div
                            className="text-xs fw-normal"
                            style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                          >
                            {sess.time} ({sess.duration})
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: isDark ? "#334155" : "#E2E8F0",
                              color: textColor,
                            }}
                          >
                            {sess.course}
                          </span>
                        </td>
                        <td className="fw-bold">{sess.title}</td>
                        <td>{sess.instructor}</td>
                        <td>{sess.type}</td>
                        <td>
                          <span
                            style={{
                              background: st.bg,
                              color: st.text,
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => setSelectedSession(sess)}
                              className="btn btn-sm d-flex align-items-center gap-1"
                              style={{
                                background: isDark ? "#334155" : "#E2E8F0",
                                color: textColor,
                                borderRadius: "8px",
                                fontWeight: "600",
                              }}
                            >
                              <Icon icon="solar:eye-bold" width="16" /> View
                            </button>
                            <button
                              onClick={() => joinClass(sess)}
                              disabled={joiningId === getSessionId(sess)}
                              className="btn btn-sm d-flex align-items-center gap-1"
                              style={{
                                background: "#FEBA01",
                                color: "#000",
                                borderRadius: "8px",
                                fontWeight: "600",
                              }}
                            >
                              {joiningId === getSessionId(sess) ? (
                                <LmsLoader variant="button" label="Joining..." />
                              ) : (
                                <>
                                  <Icon icon="solar:videocamera-record-bold" width="16" /> Join Class
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        </LmsAsyncState>
      </div>

      {/* ================= SESSION DETAILS MODAL ================= */}
      {selectedSession && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
            onClick={() => setSelectedSession(null)}
          />
          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div
                className="modal-content"
                style={{
                  background: cardBg,
                  color: textColor,
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Modal Header */}
                <div
                  className="modal-header"
                  style={{
                    background: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#FEBA01",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon icon="solar:videocamera-record-bold" width="24" />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0">
                        {selectedSession.title}
                      </h5>
                      <span className="text-xs" style={{ color: "#FEBA01" }}>
                        {selectedSession.course} • {selectedSession.type}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-close"
                    style={{ filter: isDark ? "invert(1)" : "none" }}
                    onClick={() => setSelectedSession(null)}
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div
                        className="p-3 rounded-12"
                        style={{
                          background: headerBg,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Date & Time
                        </small>
                        <div className="fw-bold mt-1">
                          {selectedSession.date}
                        </div>
                        <div className="text-xs" style={{ color: "#FEBA01" }}>
                          {selectedSession.time} ({selectedSession.duration})
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className="p-3 rounded-12"
                        style={{
                          background: headerBg,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Instructor
                        </small>
                        <div className="fw-bold mt-1">
                          {selectedSession.instructor}
                        </div>
                        <div className="text-xs" style={{ color: "#10B981" }}>
                          Verified Educator
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className="p-3 rounded-12"
                        style={{
                          background: headerBg,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Status
                        </small>
                        <div className="mt-1">
                          {(() => {
                            const st = getStatusBadge(selectedSession.status);
                            return (
                              <span
                                style={{
                                  background: st.bg,
                                  color: st.text,
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontWeight: "700",
                                  fontSize: "12px",
                                }}
                              >
                                {st.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          {selectedSession.attendees || 0} Registered
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">Class Description</h6>
                    <p style={{ color: isDark ? "#CBD5E1" : "#475569" }}>
                      {selectedSession.description ||
                        "No detailed description provided for this session."}
                    </p>
                  </div>

                  {/* Join Live Classroom */}
                  <div
                    className="p-3 rounded-12 d-flex flex-wrap align-items-center justify-content-between gap-3"
                    style={{
                      background: "linear-gradient(135deg, #FEBA01, #F59E0B)",
                      color: "#111",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Icon icon="solar:videocamera-record-bold" width="32" />
                      <div>
                        <h6 className="mb-0 fw-bold">
                          Virtual Classroom
                        </h6>
                        <small style={{ opacity: 0.85 }}>
                          Join the EduHive classroom when the instructor starts the class
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-dark fw-bold"
                      style={{ borderRadius: "8px" }}
                      disabled={joiningId === getSessionId(selectedSession)}
                      onClick={() => joinClass(selectedSession)}
                    >
                      {joiningId === getSessionId(selectedSession) ? (
                        <LmsLoader variant="button" label="Joining..." />
                      ) : (
                        <>
                          Join Class <Icon icon="solar:videocamera-record-bold" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div
                  className="modal-footer"
                  style={{ borderTop: `1px solid ${borderColor}` }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedSession(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= SCHEDULE NEW CLASS MODAL (ADMIN / TEACHER) ================= */}
      {showAddModal && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1040,
            }}
            onClick={() => setShowAddModal(false)}
          />
          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div
                className="modal-content"
                style={{
                  background: cardBg,
                  color: textColor,
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <form onSubmit={handleAddSession}>
                  <div
                    className="modal-header"
                    style={{
                      background: headerBg,
                      borderBottom: `1px solid ${borderColor}`,
                      padding: "18px 28px",
                    }}
                  >
                    <h5 className="modal-title fw-bold mb-0">Schedule New Class</h5>
                    <button
                      type="button"
                      className="btn-close ms-auto"
                      aria-label="Close"
                      style={{ filter: isDark ? "invert(1)" : "none" }}
                      onClick={() => setShowAddModal(false)}
                    />
                  </div>

                  <div className="modal-body" style={{ padding: "28px 32px 12px" }}>
                    <div className="row g-4">
                      <div className="col-md-8">
                        <label className="form-label fw-bold mb-2">
                          Class Topic / Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Advanced Data Structures"
                          value={newSession.title}
                          onChange={(e) =>
                            setNewSession({ ...newSession, title: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold mb-2">Course *</label>
                        <SearchableSelect
                          isDark={isDark}
                          options={courseSelectOptions}
                          value={
                            courseSelectOptions.find(
                              (option) => option.value === newSession.courseId
                            ) || null
                          }
                          onChange={(option) =>
                            setNewSession({
                              ...newSession,
                              courseId: option?.value || "",
                              course: option?.label || "",
                            })
                          }
                          placeholder="Search courses"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold mb-2">Instructor Name *</label>
                        <SearchableSelect
                          isDark={isDark}
                          options={teacherSelectOptions}
                          value={
                            teacherSelectOptions.find(
                              (option) =>
                                option.value === newSession.teacherId ||
                                option.label === newSession.instructor
                            ) || null
                          }
                          onChange={(option) =>
                            setNewSession({
                              ...newSession,
                              teacherId: option?.value || "",
                              instructor: option?.label || "",
                            })
                          }
                          placeholder="Search instructors"
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-bold mb-2">Date</label>
                        <input
                          type="date"
                          required
                          value={newSession.date}
                          onChange={(e) =>
                            setNewSession({ ...newSession, date: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-bold mb-2">Time</label>
                        <input
                          type="time"
                          required
                          value={newSession.time}
                          onChange={(e) =>
                            setNewSession({ ...newSession, time: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold mb-2">Duration</label>
                        <select
                          value={newSession.duration}
                          onChange={(e) =>
                            setNewSession({
                              ...newSession,
                              duration: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        >
                          <option value="45 mins">45 mins</option>
                          <option value="60 mins">60 mins</option>
                          <option value="90 mins">90 mins</option>
                          <option value="120 mins">120 mins</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold mb-2">Class Type</label>
                        <select
                          value={newSession.type}
                          onChange={(e) =>
                            setNewSession({ ...newSession, type: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        >
                          {typeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold mb-2">Description</label>
                        <textarea
                          rows="3"
                          placeholder="Agenda / Notes for the class..."
                          value={newSession.description}
                          onChange={(e) =>
                            setNewSession({
                              ...newSession,
                              description: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal-footer"
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      padding: "16px 32px 20px",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn fw-bold"
                      disabled={saving}
                      style={{ background: "#FEBA01", color: "#000", padding: "10px 18px" }}
                    >
                      {saving ? (
                        <LmsLoader variant="button" label="Saving..." />
                      ) : (
                        "Save Class Schedule"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
