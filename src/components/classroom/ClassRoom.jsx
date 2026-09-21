import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [sessionDetails, setSessionDetails] = useState(null);
  const [googleMeetLink, setGoogleMeetLink] = useState("");

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

  const joinClassroom = async () => {
    setStatus("connecting");
    setError("");
    leavingRef.current = false;

    try {
      const res = await axiosInstance.post("/api/classroom/join", {
        participantName: displayName,
        sessionId,
      });

      const nextUrl = res.data?.googleMeetLink;
      if (!nextUrl) {
        throw new Error("Google Meet link missing from API response. Please contact the administrator.");
      }

      setGoogleMeetLink(nextUrl);
      setSessionDetails(res.data?.session);
      setStatus("connected");
    } catch (err) {
      console.error("Join Classroom Error:", err);
      const resStatus = err.response?.status;
      const data = err.response?.data || {};
      
      let errorMsg = data.message || err.message || "Failed to join classroom";
      if (resStatus === 403 && data.code === "WAITING_FOR_TEACHER") {
        setStatus("waiting");
        setError("Waiting for instructor to start the class...");
        return;
      }
      
      setStatus("error");
      setError(errorMsg);
    }
  };

  useEffect(() => {
    if (sessionId) {
      joinClassroom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleLaunchMeet = () => {
    if (googleMeetLink) {
      window.open(googleMeetLink, "_blank", "noopener,noreferrer");
    }
  };

  if (status === "connecting" || status === "waiting") {
    return (
      <div className="classroom-wrapper flex flex-col items-center justify-center min-h-screen">
        <Icon icon="eos-icons:loading" width="64" height="64" className="text-primary" />
        <h2 className="mt-4 text-2xl font-bold">
          {status === "waiting" ? "Waiting for Instructor" : "Connecting to Classroom..."}
        </h2>
        {error && <p className="text-gray-500 mt-2">{error}</p>}
        {status === "waiting" && (
          <button onClick={joinClassroom} className="mt-6 bg-primary text-white px-6 py-2 rounded-md">
            Retry Connection
          </button>
        )}
        <button onClick={endClassroom} className="mt-4 text-red-500 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="classroom-wrapper flex flex-col items-center justify-center min-h-screen bg-red-50">
        <Icon icon="mdi:alert-circle-outline" width="64" height="64" className="text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-red-400 mt-2 max-w-md text-center">{error}</p>
        <button onClick={endClassroom} className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="classroom-wrapper bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl text-center">
        
        {/* Verification Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full flex items-center text-sm font-medium">
            <Icon icon="mdi:shield-check" className="mr-2" width="20" />
            {isTeacher ? "Instructor Verified" : "Student Enrolled & Verified"}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {sessionDetails?.title || classTitle || "Live Class"}
        </h1>
        
        <p className="text-gray-500 mb-8">
          Welcome, <strong>{displayName}</strong>. Your check-in has been logged.
        </p>

        <div className="bg-gray-100 p-6 rounded-lg mb-8 text-left">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500 font-medium">Course:</span>
            <span className="font-semibold text-gray-800">{sessionDetails?.course?.title || "N/A"}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-500 font-medium">Instructor:</span>
            <span className="font-semibold text-gray-800">{sessionDetails?.instructor?.name || "N/A"}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-500 font-medium">Duration:</span>
            <span className="font-semibold text-gray-800">{sessionDetails?.duration || "60 mins"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleLaunchMeet}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            <Icon icon="mdi:google-meet" width="24" className="mr-2" />
            Launch Google Meet
          </button>
          
          <button 
            onClick={leaveClassroom}
            className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            <Icon icon="mdi:exit-to-app" width="24" className="mr-2" />
            Leave & Checkout
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-8 flex items-center justify-center">
          <Icon icon="mdi:lock" className="mr-1" />
          Access is restricted to authorized EduHive students only.
        </p>
      </div>
    </div>
  );
};

export default ClassRoom;
