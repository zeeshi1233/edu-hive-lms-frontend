const SCHEDULE_KEY = "eduhive_scheduled_classes";

export function extractList(res, keys = ["data"]) {
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(data.data)) return data.data;

  if (data.data && typeof data.data === "object") {
    for (const key of keys) {
      if (Array.isArray(data.data[key])) return data.data[key];
    }
  }

  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;
  return [];
}

export function getCourseTitle(course) {
  if (!course) return "";
  if (typeof course === "string") return course;
  return (
    course.title ||
    course.name ||
    course.courseTitle ||
    course.courseName ||
    course.subject ||
    ""
  );
}

export function getCourseBoard(course) {
  if (!course || typeof course === "string") return "";
  return (
    course.board ||
    course.educationBoard ||
    course.boardName ||
    course.level ||
    course.levelType ||
    ""
  );
}

export function getCourseCode(course) {
  if (!course || typeof course === "string") return "";
  return course.code || course.courseCode || course.serialNumber || "";
}

export function courseDisplayName(course) {
  if (!course) return "";
  if (typeof course === "string") {
    // Avoid showing raw ObjectIds as course titles
    if (/^[a-f\d]{24}$/i.test(course.trim())) return "";
    const trimmed = course.trim();
    if (!trimmed || /^untitled(\s+course)?$/i.test(trimmed)) return "";
    return trimmed;
  }
  const title = getCourseTitle(course);
  if (title && /^untitled(\s+course)?$/i.test(String(title).trim())) {
    return getCourseCode(course) || "";
  }
  const board = getCourseBoard(course);
  if (title && board && !title.toLowerCase().includes(String(board).toLowerCase())) {
    return `${title} for ${board}`;
  }
  return title || getCourseCode(course) || "";
}

/** True when a course has a real selectable label (not blank / Untitled). */
export function hasValidCourseLabel(courseOrLabel) {
  const label =
    typeof courseOrLabel === "string"
      ? courseOrLabel.trim()
      : courseDisplayName(courseOrLabel);
  if (!label) return false;
  if (/^untitled(\s+course)?$/i.test(label)) return false;
  if (label === "Course") return false;
  return true;
}

export function toCourseSelectOptions(courses = []) {
  return (courses || [])
    .map((course) => ({
      value: getCourseId(course),
      label: courseDisplayName(course),
      course,
    }))
    .filter((option) => option.value && hasValidCourseLabel(option.label));
}

export function resolveSessionCourseLabel(session) {
  if (!session) return "Course";
  const courseObj =
    session.course && typeof session.course === "object" ? session.course : null;
  return (
    courseDisplayName(courseObj) ||
    session.courseTitle ||
    (typeof session.course === "string" &&
    hasValidCourseLabel(session.course) &&
    !/^[a-f\d]{24}$/i.test(session.course)
      ? session.course
      : "") ||
    session.courseCode ||
    session.title ||
    "Course"
  );
}

export function generateCourseCode(title, board) {
  const compact = (str) =>
    String(str || "")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase();

  const t = compact(title);
  const b = compact(board);
  if (t && b) return `${t}-${b}`.slice(0, 48);
  return t || b || `CRS-${Date.now().toString().slice(-6)}`;
}

export function getCourseId(course) {
  if (!course || typeof course === "string") return course || "";
  return course._id || course.id || getCourseCode(course);
}

export function loadScheduledClasses() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistScheduledClasses(list) {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(list || []));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function getTeacherName(teacher) {
  if (!teacher) return "";
  if (typeof teacher === "string") return teacher;
  return teacher.name || teacher.fullName || teacher.instructorName || "";
}

export function formatTime12h(timeOrDate) {
  if (!timeOrDate) return "";
  if (timeOrDate instanceof Date) {
    return timeOrDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  const str = String(timeOrDate).trim();
  if (str.includes("T") || str.includes("-")) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    }
  }
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2, "0")}:${mm} ${ampm}`;
  }
  return str;
}

export function normalizeCalendarSession(session) {
  if (!session) return null;

  const startSource = session.startTime || session.date || session.scheduledAt;
  const parsed = startSource ? new Date(startSource) : null;
  const validDate = parsed && !Number.isNaN(parsed.getTime());

  let dateStr = "";
  let timeStr = "";
  let time24 = "";

  if (validDate) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    dateStr = `${y}-${m}-${d}`;
    timeStr = parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    time24 = parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    dateStr = String(session.date || "").slice(0, 10);
    timeStr = session.time ? formatTime12h(session.time) : "10:00 AM";
    time24 = session.time || "10:00";
  }

  const courseObj =
    session.course && typeof session.course === "object" ? session.course : null;
  const teacherObj =
    (session.instructor && typeof session.instructor === "object"
      ? session.instructor
      : null) ||
    (session.teacher && typeof session.teacher === "object"
      ? session.teacher
      : null);

  const rawType = session.type || session.classType || "Regular Class";
  const type =
    String(rawType).toLowerCase().includes("extra")
      ? "Extra Class"
      : "Regular Class";

  const rawStatus = String(session.status || "Scheduled").toLowerCase();
  let status = session.status || "Scheduled";
  if (rawStatus === "conducted" || rawStatus === "completed") status = "Conducted";
  else if (rawStatus === "not_conducted" || rawStatus === "not conducted") {
    status = "Not Conducted";
  } else if (rawStatus === "ongoing") status = "Live";
  else if (rawStatus === "cancelled") status = "Cancelled";
  else if (rawStatus === "pending" || rawStatus === "scheduled") status = "Scheduled";

  if (session.isLive) status = "Live";

  const rawCourseLabel =
    courseDisplayName(courseObj) ||
    session.courseTitle ||
    (typeof session.course === "string" && !/^[a-f\d]{24}$/i.test(session.course)
      ? session.course
      : "") ||
    session.courseCode ||
    "";
  const courseLabel = hasValidCourseLabel(rawCourseLabel) ? rawCourseLabel : "";

  return {
    ...session,
    _id: session._id || session.id,
    title: session.title || session.topic || "Class",
    course: courseLabel || (hasValidCourseLabel(session.title) ? session.title : "") || "",
    courseId: session.courseId || courseObj?._id || courseObj?.id || "",
    instructor:
      getTeacherName(teacherObj) ||
      (typeof session.instructor === "string" ? session.instructor : "") ||
      session.teacherName ||
      "",
    teacherId: session.teacherId || teacherObj?._id || teacherObj?.id || "",
    date: dateStr,
    time: timeStr,
    time24: time24 || "10:00",
    duration: session.duration || "60 mins",
    type,
    status,
    notConductedReason: session.notConductedReason || "",
    isLive: Boolean(session.isLive),
    meetingLink: session.meetingLink || session.meetLink || "",
    description: session.description || session.topic || "",
    attendees: session.attendees || 0,
    startTime: session.startTime || (dateStr ? `${dateStr}T${timeStr}` : ""),
  };
}

export function mergeSessionLists(...lists) {
  const map = new Map();
  lists.flat().forEach((item) => {
    const normalized = normalizeCalendarSession(item);
    if (!normalized?._id && !normalized?.title) return;
    const key = String(normalized._id || `${normalized.date}-${normalized.title}`);
    if (!map.has(key)) map.set(key, normalized);
  });
  return Array.from(map.values());
}
