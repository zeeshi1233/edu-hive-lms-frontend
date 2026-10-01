export function getSessionId(session) {
  if (!session) return "";
  if (typeof session === "string") return session;
  return session._id || session.id || "";
}

export function getLiveKitRoomName(session) {
  const id = getSessionId(session);
  return id ? `eduhive-class-${id}` : "eduhive-classroom";
}

export function getClassroomPath(session) {
  const id = getSessionId(session);
  return id ? `/classroom/${id}` : "/class-calendar";
}

export function getBackendApiBase() {
  return (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "https://eduhive-lms-backend.vercel.app"
  ).replace(/\/+$/, "");
}

export function getTrackedSessionJoinUrl(session, token) {
  const id = typeof session === "object" ? getSessionId(session) : session;
  if (!id) return "";
  const backendBase = getBackendApiBase();
  const userToken =
    token !== undefined
      ? token
      : (typeof localStorage !== "undefined" ? localStorage.getItem("token") : "") || "";
  const query = userToken ? `?token=${encodeURIComponent(userToken)}` : "";
  return `${backendBase}/api/sessions/join/${id}${query}`;
}

