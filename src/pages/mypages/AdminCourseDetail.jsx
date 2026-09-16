import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";
import FormPageHeader from "../../components/common/FormPageHeader";
import {
  courseDisplayName,
  extractList,
  getCourseBoard,
  getCourseCode,
  getCourseId,
  getCourseTitle,
} from "../../utils/lmsData";
import LmsLoader from "../../components/common/LmsLoader";

const AdminCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/admin/courses/${id}`);
        const direct = res.data?.course || res.data?.data || res.data;
        if (direct && (direct._id || direct.title || direct.name)) {
          setCourse(direct);
          return;
        }
      } catch {
        // fallback to list lookup
      }

      try {
        const res = await axiosInstance.get("/api/admin/courses");
        const list = extractList(res, ["courses", "data"]);
        const found = list.find(
          (item) =>
            getCourseId(item) === id ||
            getCourseCode(item) === id ||
            String(item._id) === String(id)
        );
        setCourse(found || null);
      } catch {
        setCourse(null);
      }
    };

    load().finally(() => setLoading(false));
  }, [id]);

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const muted = isDark ? "#94A3B8" : "#64748B";
  const border = isDark ? "#334155" : "#E2E8F0";
  const softBg = isDark ? "#0F172A" : "#F8FAFC";
  const code = getCourseCode(course);
  const board = getCourseBoard(course);
  const teachers =
    course?.assignedTeachers ||
    course?.teachers ||
    (course?.instructor
      ? [typeof course.instructor === "object" ? course.instructor : null].filter(Boolean)
      : []);

  const actionBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    padding: "7px 12px",
    minHeight: 34,
    borderRadius: 8,
    border: "none",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };

  return (
    <div>
      <FormPageHeader
        title="Course Details"
        subtitle="Course code, board, and assigned instructors"
        backTo="/all-courses"
      />

      <div
        className="card border-0"
        style={{
          background: cardBg,
          color: textColor,
          borderRadius: 16,
          border: `1px solid ${border}`,
          padding: "20px 22px",
          width: "100%",
        }}
      >
        {loading ? (
          <LmsLoader label="Loading course..." style={{ minHeight: 180 }} />
        ) : !course ? (
          <div className="text-center py-4">
            <p style={{ color: muted }}>This course link is invalid or the course was removed.</p>
            <button
              type="button"
              className="lms-btn-primary lms-btn-sm"
              onClick={() => navigate("/all-courses")}
            >
              Back to Courses
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
              <div style={{ minWidth: 0, flex: "1 1 280px" }}>
                <span className="lms-kicker">Course</span>
                <h3
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "1.25rem",
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                    wordBreak: "break-word",
                  }}
                >
                  {courseDisplayName(course)}
                </h3>
                <div className="d-flex flex-wrap gap-2">
                  {code ? <span className="lms-chip lms-chip-gold">{code}</span> : null}
                  {board ? <span className="lms-chip lms-chip-blue">{board}</span> : null}
                  <span
                    className={`lms-chip ${
                      course.isActive === false ? "lms-chip-red" : "lms-chip-green"
                    }`}
                  >
                    {course.isActive === false ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>

              <Link
                to={`/edit-course/${getCourseId(course)}`}
                state={{ course }}
                className="lms-btn-primary lms-btn-sm"
                style={{ flexShrink: 0 }}
              >
                <Icon icon="solar:pen-bold" width="15" />
                Edit Course
              </Link>
            </div>

            <div className="row g-2 g-md-3">
              <div className="col-sm-4">
                <div className="lms-info-tile" style={{ padding: "12px 14px" }}>
                  <small>Subject</small>
                  <strong style={{ fontSize: 14 }}>{getCourseTitle(course) || "N/A"}</strong>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="lms-info-tile" style={{ padding: "12px 14px" }}>
                  <small>Education Board</small>
                  <strong style={{ fontSize: 14 }}>{board || "Not assigned"}</strong>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="lms-info-tile" style={{ padding: "12px 14px" }}>
                  <small>Course Code</small>
                  <strong style={{ fontSize: 14 }}>{code || "Not generated"}</strong>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>
                Description
              </h6>
              <p style={{ color: muted, marginBottom: 0, fontSize: 14, lineHeight: 1.55 }}>
                {course.description || "No description provided."}
              </p>
            </div>

            <div className="mt-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0" style={{ fontSize: 14 }}>
                  Assigned Teachers
                </h6>
                <small style={{ color: muted, fontSize: 12 }}>
                  {teachers.length} instructor{teachers.length === 1 ? "" : "s"}
                </small>
              </div>

              {teachers.length === 0 ? (
                <div
                  className="p-3 rounded-3"
                  style={{
                    background: softBg,
                    border: `1px dashed ${border}`,
                    color: muted,
                    fontSize: 13,
                  }}
                >
                  No teachers are assigned to this course yet.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id || teacher.id || teacher.name}
                      className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 px-3 rounded-3"
                      style={{
                        background: softBg,
                        border: `1px solid ${border}`,
                      }}
                    >
                      <button
                        type="button"
                        className="btn p-0 text-start d-flex align-items-center gap-2"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: textColor,
                          minWidth: 0,
                        }}
                        onClick={() =>
                          navigate("/all-teacher", {
                            state: { viewTeacherId: teacher._id || teacher.id },
                          })
                        }
                      >
                        <img
                          src={
                            teacher.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              teacher.name || "teacher"
                            )}`
                          }
                          alt=""
                          width={36}
                          height={36}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #FEBA01",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="fw-bold"
                            style={{
                              color: "#B45309",
                              fontSize: 13,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {teacher.name || "Teacher"}
                          </div>
                          <small style={{ color: muted, fontSize: 12 }}>
                            {teacher.email || teacher.qualification || "Assigned instructor"}
                          </small>
                        </div>
                      </button>

                      <div className="d-flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          style={{ ...actionBtn, background: "#FEBA01", color: "#111" }}
                          onClick={() =>
                            navigate("/all-teacher", {
                              state: { viewTeacherId: teacher._id || teacher.id },
                            })
                          }
                        >
                          <Icon icon="iconamoon:eye-light" width={15} />
                          View
                        </button>
                        <button
                          type="button"
                          style={{ ...actionBtn, background: "#0EA5E9", color: "#fff" }}
                          onClick={async () => {
                            try {
                              const res = await axiosInstance.get("/api/admin/teachers");
                              const list = res.data?.teachers || [];
                              const full =
                                list.find(
                                  (t) =>
                                    String(t._id) === String(teacher._id || teacher.id)
                                ) || teacher;
                              navigate("/add-teacher", { state: full });
                            } catch {
                              navigate("/add-teacher", { state: teacher });
                            }
                          }}
                        >
                          <Icon icon="solar:pen-bold" width={15} />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetail;
