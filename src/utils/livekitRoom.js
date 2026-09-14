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
