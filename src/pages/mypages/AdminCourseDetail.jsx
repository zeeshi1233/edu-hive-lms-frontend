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
  const code = getCourseCode(course);
  const board = getCourseBoard(course);

  return (
    <div className="lms-page">
      <FormPageHeader
        title="Course Details"
        subtitle="Direct course link with unique course code and board information"
        backTo="/all-courses"
      />

      <div
        className="card border-0"
        style={{
          background: cardBg,
          color: textColor,
          borderRadius: "18px",
          border: `1px solid ${border}`,
          padding: "28px",
        }}
      >
        {loading ? (
          <LmsLoader label="Loading course..." style={{ minHeight: 180 }} />
        ) : !course ? (
          <div className="text-center py-4">
            <p style={{ color: muted }}>This course link is invalid or the course was removed.</p>
            <button
              type="button"
              className="lms-btn-primary"
              onClick={() => navigate("/all-courses")}
            >
              Back to Courses
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
              <div>
                <span className="lms-kicker">Course Link</span>
                <h3 className="fw-bold mb-2" style={{ fontSize: "28px" }}>
                  {courseDisplayName(course)}
                </h3>
                <div className="d-flex flex-wrap gap-2">
                  {code ? (
                    <span className="lms-chip lms-chip-gold">{code}</span>
                  ) : null}
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
                className="lms-btn-primary d-flex align-items-center gap-1"
              >
                <Icon icon="solar:pen-bold" width="18" />
                Edit Course
              </Link>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="lms-info-tile">
                  <small>Subject</small>
                  <strong>{getCourseTitle(course) || "N/A"}</strong>
                </div>
              </div>
              <div className="col-md-4">
                <div className="lms-info-tile">
                  <small>Education Board</small>
                  <strong>{board || "Not assigned"}</strong>
                </div>
              </div>
              <div className="col-md-4">
                <div className="lms-info-tile">
                  <small>Course Code</small>
                  <strong>{code || "Not generated"}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h6 className="fw-bold">Description</h6>
              <p style={{ color: muted, marginBottom: 0 }}>
                {course.description || "No description provided."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetail;
