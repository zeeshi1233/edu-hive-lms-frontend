import React, { useEffect, useMemo, useRef, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const ClassRoom = ({
  roomName,
  userName,
  sessionId,
  classTitle,
  role: roleProp,
  onLeave,
}) => {
  const navigate = useNavigate();
  const leavingRef = useRef(false);
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [checkInTime, setCheckInTime] = useState(null);

  const role = (roleProp || localStorage.getItem("role") || "").toLowerCase();
  const isTeacher = role === "teacher";

  const displayName = useMemo(
    () => userName || localStorage.getItem("userName") || "Participant",
    [userName]
  );

  const leavePath = () => {
    if (role === "student") return "/student-dashboard";
    if (role === "teacher") return "/teacher-dashboard";
    return "/class-calendar";
  };

  const endClassroom = () => {
    setStatus("disconnected");
    if (onLeave) {
      onLeave();
      return;
    }
    navigate(leavePath());
  };

  const leaveClassroom = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    try {
      if (sessionId) {
        await axiosInstance.post("/api/classroom/leave", { sessionId });
      }
    } catch (err) {
      console.error("Failed to leave classroom", err);
    } finally {
      endClassroom();
    }
  };

  const fetchToken = async ({ silent } = {}) => {
    if (!silent) {
      setStatus("connecting");
      setError("");
      setToken("");
    }

    try {
      const res = await axiosInstance.post("/api/classroom/join", {
        participantName: displayName,
        sessionId,
      });

      const nextToken = res.data?.token;
      const nextUrl = res.data?.url || res.data?.livekitUrl;

      if (!nextToken || !nextUrl) {
        throw new Error("LiveKit token or server URL missing from API response");
      }

      setToken(nextToken);
      setServerUrl(nextUrl);
      setCheckInTime(res.data?.teacherCheckInTime || null);
      setStatus("connecting");
      setError("");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "WAITING_FOR_TEACHER") {
        setStatus("waiting");
        setError(err.response?.data?.message || "Waiting for instructor to start the class");
        return;
      }
      setStatus("error");
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not join the virtual classroom"
      );
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Missing class session id");
      return;
    }
    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, displayName]);

  useEffect(() => {
    if (status !== "waiting") return undefined;
    const timer = setInterval(() => fetchToken({ silent: true }), 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionId]);

  const shell = {
    minHeight: "calc(100vh - 140px)",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#0F172A",
    color: "#F8FAFC",
  };

  if ((status === "connecting" && !token) || status === "waiting") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5" style={shell}>
        <div
          className="mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(254, 186, 1, 0.16)",
            color: "#FEBA01",
          }}
        >
          <Icon
            icon={status === "waiting" ? "solar:hourglass-bold" : "solar:videocamera-record-bold"}
            width="32"
          />
        </div>
        <h4 className="fw-bold mb-1">
          {status === "waiting" ? "Waiting for instructor" : "Connecting to class..."}
        </h4>
        <p className="mb-0 text-center" style={{ color: "#94A3B8", maxWidth: 420 }}>
          {status === "waiting"
            ? error || "The class will start when the instructor checks in."
            : classTitle || "Preparing your EduHive classroom"}
        </p>
      </div>
    );
  }

  if (status === "error" || status === "disconnected") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={shell}>
        <Icon
          icon={status === "disconnected" ? "solar:logout-3-bold" : "solar:danger-triangle-bold"}
          width="42"
          style={{ color: "#FEBA01" }}
        />
        <h4 className="fw-bold mt-3 mb-2">
          {status === "disconnected"
            ? isTeacher
              ? "Class ended"
              : "You left the classroom"
            : "Unable to join class"}
        </h4>
        <p style={{ color: "#94A3B8", maxWidth: 420 }}>
          {error ||
            (isTeacher
              ? "Instructor checkout is saved. Students can no longer join this class."
              : "The class has ended. You can go back to the dashboard.")}
        </p>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <button type="button" className="lms-btn-ghost" onClick={() => navigate(leavePath())}>
            Back to Dashboard
          </button>
          {!isTeacher && (
            <button type="button" className="lms-btn-primary" onClick={() => fetchToken()}>
              Rejoin Class
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lms-classroom" style={shell}>
      <div
        className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2"
        style={{ background: "#111827", borderBottom: "1px solid #1F2937" }}
      >
        <div>
          <span className="lms-kicker mb-0">EduHive Classroom</span>
          <h6 className="mb-0 fw-bold text-white">{classTitle || roomName}</h6>
          {isTeacher && checkInTime && (
            <small style={{ color: "#94A3B8" }}>
              Checked in at {new Date(checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </small>
          )}
        </div>
        <button type="button" className="lms-btn-ghost" onClick={leaveClassroom}>
          {isTeacher ? "End Class" : "Leave Class"}
        </button>
      </div>

      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        video
        audio
        data-lk-theme="default"
        style={{ height: "calc(100vh - 210px)" }}
        onConnected={() => setStatus("connected")}
        onDisconnected={() => {
          if (!leavingRef.current) setStatus("disconnected");
        }}
        onError={(err) => {
          setStatus("error");
          setError(err?.message || "Classroom connection failed");
        }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
};

export default ClassRoom;
