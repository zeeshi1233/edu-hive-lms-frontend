import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (date, opts) =>
  date
    ? new Date(date).toLocaleString("en-US", opts)
    : null;

const fmtTime = (d) => fmt(d, { hour: "2-digit", minute: "2-digit", hour12: true });
const fmtDate = (d) => fmt(d, { day: "numeric", month: "short", year: "numeric" });

/* ─── status badge helper ─────────────────────────────────────────────────── */
const StatusPill = ({ label, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 12px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.4,
      background: color + "22",
      color,
      border: `1.5px solid ${color}44`,
    }}
  >
    {label}
  </span>
);

/* ─── loading / error screens ─────────────────────────────────────────────── */
const FullScreen = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
      color: "#fff",
      padding: 24,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────────
   Main Component
   ─────────────────────────────────────────────────────────────────────────── */
const ClassRoom = ({ userName, sessionId, classTitle, role: roleProp, onLeave }) => {
  const navigate = useNavigate();
  const leavingRef = useRef(false);

  const [status, setStatus] = useState("connecting"); // connecting | waiting | connected | error
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [meetLink, setMeetLink] = useState("");
  const [checkInTime] = useState(new Date()); // track when they got the link

  const role = (roleProp || localStorage.getItem("role") || "").toLowerCase();
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";

  const displayName = useMemo(
    () => userName || localStorage.getItem("userName") || "Participant",
    [userName]
  );

  /* ── navigation ── */
  const goBack = useCallback(() => {
    if (onLeave) return onLeave();
    if (role === "student") navigate("/student-dashboard");
    else if (role === "teacher") navigate("/teacher-dashboard");
    else navigate("/class-calendar");
  }, [role, onLeave, navigate]);

  /* ── leave & checkout ── */
  const leaveClassroom = useCallback(async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    try {
      if (sessionId) await axiosInstance.post("/api/classroom/leave", { sessionId });
    } catch (e) {
      console.error("Leave error", e);
    } finally {
      goBack();
    }
  }, [sessionId, goBack]);

  /* ── join / get meet link ── */
  const joinClassroom = useCallback(async () => {
    setStatus("connecting");
    setError("");
    leavingRef.current = false;
    try {
      const res = await axiosInstance.post("/api/classroom/join", {
        participantName: displayName,
        sessionId,
      });
      const link = res.data?.googleMeetLink;
      if (!link) throw new Error("Google Meet link not found. Please contact admin.");
      setMeetLink(link);
      setSession(res.data?.session);
      setStatus("connected");
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.message || "Failed to join.";
      if (code === "WAITING_FOR_TEACHER") {
        setStatus("waiting");
        setError("The instructor hasn't started the class yet. Please wait...");
      } else {
        setStatus("error");
        setError(msg);
      }
    }
  }, [sessionId, displayName]);

  useEffect(() => {
    if (sessionId) joinClassroom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const launchMeet = () => {
    if (meetLink) window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  /* ══════════════════════════════════════════════════════════════════════════
     LOADING / WAITING
  ══════════════════════════════════════════════════════════════════════════ */
  if (status === "connecting" || status === "waiting") {
    return (
      <FullScreen>
        {/* animated ring */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "3px solid #1e40af33",
            borderTop: "3px solid #3b82f6",
            animation: "spin 1s linear infinite",
            marginBottom: 24,
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {status === "waiting" ? "Waiting for Instructor…" : "Verifying Access…"}
        </h2>
        <p style={{ color: "#94a3b8", maxWidth: 340, lineHeight: 1.6 }}>
          {status === "waiting"
            ? error || "Your enrollment is confirmed. Waiting for the teacher to start."
            : "Checking your enrollment and preparing the classroom."}
        </p>

        {status === "waiting" && (
          <button
            onClick={joinClassroom}
            style={{
              marginTop: 24,
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        )}
        <button
          onClick={goBack}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Go Back
        </button>
      </FullScreen>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ERROR / ACCESS DENIED
  ══════════════════════════════════════════════════════════════════════════ */
  if (status === "error") {
    return (
      <FullScreen>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#ef444420",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Icon icon="mdi:lock-remove-outline" width={40} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ color: "#94a3b8", maxWidth: 360, lineHeight: 1.6 }}>{error}</p>
        <button
          onClick={goBack}
          style={{
            marginTop: 24,
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            background: "#ef4444",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Return to Dashboard
        </button>
      </FullScreen>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CONNECTED — Main Classroom Gateway
  ══════════════════════════════════════════════════════════════════════════ */
  const instructor = session?.instructor || session?.teacher;
  const course = session?.course;
  const teacherName = instructor?.name || "Instructor";
  const courseName = course?.title || session?.courseTitle || "—";
  const sessionTitle = session?.title || classTitle || "Live Class";
  const sessionStatus = String(session?.status || "Scheduled");

  const statusColor =
    sessionStatus.toLowerCase() === "ongoing"
      ? "#10b981"
      : sessionStatus.toLowerCase() === "conducted"
      ? "#3b82f6"
      : "#f59e0b";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "rgba(30,41,59,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* ── Header strip ── */}
        <div
          style={{
            background: "linear-gradient(90deg,#1d4ed8,#2563eb,#1d4ed8)",
            padding: "20px 28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* glow blobs */}
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "#ffffff12",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -20,
              bottom: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#ffffff08",
            }}
          />

          {/* badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff22",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 12,
              color: "#e0f2fe",
              fontWeight: 600,
              marginBottom: 12,
              backdropFilter: "blur(8px)",
            }}
          >
            <Icon icon="mdi:shield-check" width={14} />
            {isTeacher ? "Instructor Verified" : isAdmin ? "Admin Access" : "Student Enrolled & Verified"}
          </div>

          <h1
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: -0.3,
            }}
          >
            {sessionTitle}
          </h1>
          <p style={{ color: "#93c5fd", fontSize: 13, marginTop: 4 }}>
            Welcome, <strong style={{ color: "#fff" }}>{displayName}</strong> · Check-in logged at {fmtTime(checkInTime)}
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 28px" }}>

          {/* Session info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 20px",
              marginBottom: 24,
            }}
          >
            {[
              { icon: "mdi:book-open-variant", label: "Course", value: courseName },
              { icon: "mdi:account-tie", label: isTeacher ? "Your Session" : "Instructor", value: teacherName },
              { icon: "mdi:clock-outline", label: "Duration", value: session?.duration || "60 mins" },
              {
                icon: "mdi:calendar",
                label: "Date",
                value: fmtDate(session?.startTime) || "—",
              },
              {
                icon: "mdi:clock-start",
                label: "Starts At",
                value: fmtTime(session?.startTime) || "—",
              },
              {
                icon: "mdi:tag-outline",
                label: "Status",
                value: <StatusPill label={sessionStatus} color={statusColor} />,
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Icon icon={icon} width={14} color="#64748b" />
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {label}
                  </span>
                </div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Host Info: only teacher is host, not admin */}
          {(isTeacher) && (
            <div
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <Icon icon="mdi:crown" width={18} color="#fbbf24" />
              <span style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>
                You are the <strong style={{ color: "#fff" }}>Host</strong> of this meeting. Your check-in starts the class for students.
              </span>
            </div>
          )}

          {/* Google Meet topic / description */}
          {session?.description && (
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              {session.description}
            </p>
          )}

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Launch Google Meet */}
            <button
              onClick={launchMeet}
              style={{
                flex: "1 1 200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "14px 20px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 24px #2563eb44",
                transition: "transform 0.15s,box-shadow 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <Icon icon="simple-icons:googlemeet" width={20} />
              Launch Google Meet
            </button>

            {/* Leave */}
            <button
              onClick={leaveClassroom}
              style={{
                flex: "1 1 140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 20px",
                borderRadius: 14,
                border: "1px solid rgba(239,68,68,0.4)",
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
            >
              <Icon icon="mdi:exit-to-app" width={20} />
              Leave & Checkout
            </button>
          </div>

          {/* Security notice */}
          <p
            style={{
              marginTop: 20,
              fontSize: 11,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 5,
              justifyContent: "center",
            }}
          >
            <Icon icon="mdi:lock" width={12} />
            Restricted to authorized EduHive members only. Sharing this link outside the platform is not allowed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;
