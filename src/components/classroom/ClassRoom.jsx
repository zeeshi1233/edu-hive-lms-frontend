import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (date, opts) =>
  date ? new Date(date).toLocaleString("en-US", opts) : null;

const fmtTime = (d) => fmt(d, { hour: "2-digit", minute: "2-digit", hour12: true });
const fmtDate = (d) => fmt(d, { day: "numeric", month: "short", year: "numeric" });

/* ─── LMS theme tokens (matches lms-panel.css) ───────────────────────────── */
const T = {
  gold:      "#FEBA01",
  goldDark:  "#d49800",
  goldSoft:  "rgba(254,186,1,0.13)",
  goldSoft2: "rgba(254,186,1,0.25)",
  black:     "#0f172a",
  surface:   "#ffffff",
  surface2:  "#fffdf7",
  border:    "#e8ecf3",
  muted:     "#64748b",
  text:      "#0f172a",
  danger:    "#ef4444",
  success:   "#10b981",
  shadow:    "0 10px 40px rgba(15,23,42,0.1)",
  shadowHov: "0 20px 60px rgba(254,186,1,0.18)",
  radius:    "20px",
};

/* ─── Reusable mini components ───────────────────────────────────────────── */
const InfoCard = ({ icon, label, value }) => (
  <div
    style={{
      background: T.surface,
      border: `1.5px solid ${T.border}`,
      borderRadius: 14,
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Icon icon={icon} width={13} color={T.gold} />
      <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{value}</div>
  </div>
);

const StatusPill = ({ label }) => {
  const raw = String(label || "").toLowerCase();
  const isOngoing = raw === "ongoing";
  const isScheduled = raw === "scheduled";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: isOngoing ? "#10b98120" : isScheduled ? T.goldSoft2 : "#e2e8f0",
        color:      isOngoing ? "#10b981"   : isScheduled ? T.goldDark  : T.muted,
        border:     isOngoing ? "1.5px solid #10b98140" : isScheduled ? `1.5px solid ${T.gold}44` : "1.5px solid #cbd5e1",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {label}
    </span>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   Main Component
─────────────────────────────────────────────────────────────────────────── */
const ClassRoom = ({ userName, sessionId, classTitle, role: roleProp, onLeave }) => {
  const navigate   = useNavigate();
  const leavingRef = useRef(false);

  const [status,   setStatus  ] = useState("connecting");
  const [error,    setError   ] = useState("");
  const [session,  setSession ] = useState(null);
  const [meetLink, setMeetLink] = useState("");
  const [checkIn]               = useState(new Date());

  const role      = (roleProp || localStorage.getItem("role") || "").toLowerCase();
  const isTeacher = role === "teacher";

  const displayName = useMemo(
    () => userName || localStorage.getItem("userName") || "Participant",
    [userName]
  );

  /* ── navigation ── */
  const goBack = useCallback(() => {
    if (onLeave) return onLeave();
    if (role === "student")  navigate("/student-dashboard");
    else if (role === "teacher") navigate("/teacher-dashboard");
    else navigate("/class-calendar");
  }, [role, onLeave, navigate]);

  /* ── leave & checkout ── */
  const leaveClassroom = useCallback(async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    try {
      if (sessionId) {
        try {
          await axiosInstance.post(`/api/sessions/${sessionId}/leave`, { sessionId });
        } catch (_) {
          await axiosInstance.post("/api/classroom/leave", { sessionId });
        }
      }
    } catch (e) { console.error("Leave error", e); }
    finally { goBack(); }
  }, [sessionId, goBack]);

  // Reliable checkout on window close, refresh, or component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!leavingRef.current && sessionId) {
        leavingRef.current = true;
        const token = localStorage.getItem("token");
        const base = axiosInstance.defaults.baseURL || "";
        const url = `${base}/api/sessions/${sessionId}/leave`;
        try {
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ sessionId }),
            keepalive: true,
          });
        } catch (_) {}
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      if (!leavingRef.current && sessionId) {
        leavingRef.current = true;
        axiosInstance.post(`/api/sessions/${sessionId}/leave`, { sessionId }).catch(() => {
          axiosInstance.post("/api/classroom/leave", { sessionId }).catch(() => {});
        });
      }
    };
  }, [sessionId]);

  /* ── join / get meet link ── */
  const joinClassroom = useCallback(async () => {
    setStatus("connecting");
    setError("");
    leavingRef.current = false;
    try {
      let res;
      try {
        res = await axiosInstance.post(`/api/sessions/${sessionId}/join`, {
          participantName: displayName,
          sessionId,
        });
      } catch (postErr) {
        const isExpired =
          postErr.response?.data?.code === "SESSION_EXPIRED" ||
          (postErr.response?.data?.message || "").toLowerCase().includes("expired");
        if (isExpired) {
          throw postErr;
        }
        res = await axiosInstance.post("/api/classroom/join", {
          participantName: displayName,
          sessionId,
        });
      }

      const sessionData = res.data?.session;

      // Client-side verification of expiration
      if (sessionData) {
        const isExp = sessionData.isExpired || (sessionData.endTime && Date.now() > new Date(sessionData.endTime).getTime());
        if (isExp) {
          setStatus("expired");
          setError("This session has expired.");
          setSession(sessionData);
          return;
        }
      }

      const link =
        res.data?.googleMeetLink ||
        sessionData?.googleMeetLink ||
        sessionData?.link ||
        sessionData?.meetingLink;
      if (!link) throw new Error("Video room link not found. Please contact admin.");
      setMeetLink(link);
      setSession(sessionData);
      setStatus("connected");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/", { replace: true, state: { from: `/classroom/${sessionId}` } });
        return;
      }

      const isExpiredErr =
        err.response?.data?.code === "SESSION_EXPIRED" ||
        (err.response?.data?.message || "").toLowerCase().includes("expired");

      if (isExpiredErr) {
        setStatus("expired");
        setError("This session has expired.");
        return;
      }

      const msg = err.response?.data?.message || err.message || "Failed to join.";

      // Fallback check
      try {
        const fallbackRes = await axiosInstance.get(`/api/classroom/${sessionId}`);
        const fallbackSession = fallbackRes.data?.session;
        if (fallbackSession) {
          const isExp = fallbackSession.isExpired || (fallbackSession.endTime && Date.now() > new Date(fallbackSession.endTime).getTime());
          if (isExp) {
            setStatus("expired");
            setError("This session has expired.");
            setSession(fallbackSession);
            return;
          }
        }
        const fallbackLink =
          fallbackRes.data?.googleMeetLink ||
          fallbackSession?.googleMeetLink ||
          fallbackSession?.link ||
          fallbackSession?.meetingLink;
        if (fallbackLink) {
          setMeetLink(fallbackLink);
          setSession(fallbackSession);
          setStatus("connected");
          return;
        }
      } catch (_) {}

      setStatus("error");
      setError(msg);
    }
  }, [sessionId, displayName, navigate]);

  useEffect(() => {
    if (sessionId) joinClassroom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  /* ══════════════════════════════════ EXPIRED SESSION ══════════════════ */
  if (status === "expired") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg,#fffdf7 0%,#fff5f5 100%)",
          padding: 24,
          textAlign: "center",
          fontFamily: "'Inter',system-ui,sans-serif",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "#fee2e2",
            border: "2px solid #fca5a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 10px 30px rgba(239,68,68,0.15)",
          }}
        >
          <Icon icon="solar:clock-circle-bold" width={44} color="#ef4444" />
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: "#fee2e2",
            color: "#dc2626",
            marginBottom: 12,
            border: "1px solid #fecaca",
          }}
        >
          Meeting Link Deactivated
        </span>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 8, letterSpacing: "-0.02em" }}>
          This session has expired.
        </h2>
        <p style={{ color: "#64748b", maxWidth: 440, lineHeight: 1.6, fontSize: 14, marginBottom: 24 }}>
          The scheduled time window for this live class has ended. Meeting links automatically expire after the session end time for security and attendance integrity.
        </p>

        {session && (
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 16,
              padding: "16px 24px",
              maxWidth: 420,
              width: "100%",
              marginBottom: 24,
              textAlign: "left",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>
              Class Details
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
              {session.title || "Live Class"}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", display: "flex", flexDirection: "column", gap: 4 }}>
              <div><strong>Course:</strong> {session.course?.title || session.courseTitle || "—"}</div>
              <div><strong>Scheduled:</strong> {fmtTime(session.startTime)} - {fmtTime(session.endTime)}</div>
              <div><strong>Duration:</strong> {session.duration || "60 mins"}</div>
            </div>
          </div>
        )}

        <button
          onClick={goBack}
          style={{
            padding: "12px 32px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#FEBA01,#f5a800)",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(254,186,1,0.25)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  /* ══════════════════════════════════ CONNECTING / PREPARING ROOM ══════════════════ */
  if (status === "connecting") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg,#fffdf7 0%,#f6f7fb 100%)",
          padding: 24,
          textAlign: "center",
        }}
      >
        {/* Spinning gold ring */}
        <div style={{ position: "relative", width: 88, height: 88, marginBottom: 24 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${T.goldSoft2}`,
              borderTop: `3px solid ${T.gold}`,
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              background: T.goldSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="simple-icons:googlemeet" width={28} color={T.gold} />
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8 }}>
          Connecting to Video Room…
        </h2>
        <p style={{ color: T.muted, maxWidth: 340, lineHeight: 1.7, fontSize: 14 }}>
          Preparing your live classroom interface and connecting your session…
        </p>

        <button
          onClick={goBack}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            color: T.muted,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  /* ══════════════════════════════════ ERROR ══════════════════════════════ */
  if (status === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff5f5", padding: 24, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Icon icon="mdi:lock-remove-outline" width={40} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: "#64748b", maxWidth: 360, lineHeight: 1.7, fontSize: 14 }}>{error}</p>
        <button onClick={goBack} style={{ marginTop: 24, padding: "11px 32px", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  /* ══════════════════════════════════ CONNECTED — Main UI ════════════════ */
  const instructor  = session?.instructor || session?.teacher;
  const course      = session?.course;
  const teacherName = instructor?.name || "Instructor";
  const courseName  = course?.title || session?.courseTitle || "—";
  const sessionTitle= session?.title || classTitle || "Live Class";
  const sessionStat = String(session?.status || "Scheduled");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#fffdf7 0%,#f6f7fb 60%,#f3f6fb 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      {/* ── Main Card ── */}
      <div style={{
        width: "100%",
        maxWidth: 560,
        background: T.surface,
        borderRadius: T.radius,
        boxShadow: T.shadow,
        border: `1.5px solid ${T.border}`,
        overflow: "hidden",
        transition: "box-shadow 0.3s",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowHov}
        onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
      >
        {/* ── Gold header strip ── */}
        <div style={{
          background: `linear-gradient(135deg,${T.gold} 0%,#f5a800 100%)`,
          padding: "28px 32px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "#ffffff18" }} />
          <div style={{ position: "absolute", left: -20, bottom: -40, width: 110, height: 110, borderRadius: "50%", background: "#ffffff10" }} />

          {/* verification badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(0,0,0,0.15)", borderRadius: 999, padding: "4px 14px",
            fontSize: 11, color: "#fff", fontWeight: 700, marginBottom: 14, letterSpacing: 0.3,
          }}>
            <Icon icon="mdi:shield-check" width={13} />
            {isTeacher ? "Instructor Verified — You are the Host" : "Student Enrolled & Verified"}
          </div>

          <h1 style={{ color: T.black, fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.3, letterSpacing: -0.3 }}>
            {sessionTitle}
          </h1>
          <p style={{ color: "rgba(0,0,0,0.55)", fontSize: 13, marginTop: 6 }}>
            Welcome, <strong style={{ color: T.black }}>{displayName}</strong> · Check-in at {fmtTime(checkIn)}
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 28px 28px" }}>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <InfoCard icon="mdi:book-open-variant"  label="Course"      value={courseName} />
            <InfoCard icon="mdi:account-tie"         label={isTeacher ? "Your Session" : "Instructor"} value={teacherName} />
            <InfoCard icon="mdi:clock-outline"       label="Duration"    value={session?.duration || "60 mins"} />
            <InfoCard icon="mdi:calendar"            label="Date"        value={fmtDate(session?.startTime) || "—"} />
            <InfoCard icon="mdi:clock-start"         label="Starts At"   value={fmtTime(session?.startTime) || "—"} />
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon icon="mdi:tag-outline" width={13} color={T.gold} />
                <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>Status</span>
              </div>
              <StatusPill label={sessionStat} />
            </div>
          </div>

          {/* Teacher host notice */}
          {isTeacher && (
            <div style={{
              background: T.goldSoft,
              border: `1.5px solid ${T.gold}44`,
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 20,
            }}>
              <Icon icon="mdi:crown" width={18} color={T.gold} />
              <span style={{ fontSize: 13, color: T.goldDark, fontWeight: 600 }}>
                You are the <strong>Host</strong> of this meeting. Your check-in starts the session for students.
              </span>
            </div>
          )}

          {/* Concluded notice */}
          {(session?.status === "conducted" || session?.status === "completed" || session?.teacherAttendance?.checkOutTime) && (
            <div style={{
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 20,
            }}>
              <Icon icon="mdi:information-outline" width={18} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                This session has concluded and checkout has been finalized.
              </span>
            </div>
          )}

          {/* Description */}
          {session?.description && (
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
              {session.description}
            </p>
          )}

          {/* ── Action Buttons ── */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Launch Google Meet — only show if there's a real Google Meet link */}
            {meetLink && meetLink.startsWith("https://meet.google.com") ? (
              <button
                onClick={() => window.open(meetLink, "_blank", "noopener,noreferrer")}
                style={{
                  flex: "1 1 200px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "15px 20px",
                  borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg,${T.gold},#f5a800)`,
                  color: T.black,
                  fontSize: 15, fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 6px 24px ${T.goldSoft2}`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${T.goldSoft2}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = `0 6px 24px ${T.goldSoft2}`; }}
              >
                <Icon icon="simple-icons:googlemeet" width={20} />
                Launch Google Meet
              </button>
            ) : (
              <div style={{
                flex: "1 1 200px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "15px 20px",
                borderRadius: 14,
                background: T.goldSoft,
                border: `1.5px solid ${T.gold}55`,
                color: T.goldDark,
                fontSize: 14, fontWeight: 700,
              }}>
                <Icon icon="mdi:check-circle" width={20} color={T.gold} />
                You are already in the classroom
              </div>
            )}

            {/* Leave */}
            <button
              onClick={leaveClassroom}
              style={{
                flex: "1 1 140px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "15px 20px",
                borderRadius: 14,
                border: "1.5px solid #fecaca",
                background: "#fff5f5",
                color: "#dc2626",
                fontSize: 15, fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
            >
              <Icon icon="mdi:exit-to-app" width={20} />
              Leave & Checkout
            </button>
          </div>

          {/* Security footer */}
          <p style={{ marginTop: 18, fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
            <Icon icon="mdi:lock" width={12} />
            Restricted to authorized EduHive members only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;
