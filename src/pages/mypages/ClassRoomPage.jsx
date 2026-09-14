import React from "react";
import { useLocation, useParams } from "react-router-dom";
import ClassRoom from "../../components/classroom/ClassRoom";
import { useAuth } from "../../context/AppContext";
import { getLiveKitRoomName } from "../../utils/livekitRoom";

const ClassRoomPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const { user, role } = useAuth();

  const roomName = location.state?.roomName || getLiveKitRoomName(sessionId);
  const classTitle = location.state?.classTitle || "Live Class";
  const userName =
    user?.name ||
    localStorage.getItem("userName") ||
    "Participant";

  return (
    <div className="lms-page">
      <ClassRoom
        roomName={roomName}
        userName={userName}
        sessionId={sessionId}
        classTitle={classTitle}
        role={role || user?.role}
      />
    </div>
  );
};

export default ClassRoomPage;
