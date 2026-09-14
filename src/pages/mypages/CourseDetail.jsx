import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";

export default function CourseDetail() {
  const [assignments, setAssignments] = useState([]);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  /* ================= THEME OBSERVER ================= */
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

  /* ================= FETCH ASSIGNMENTS ================= */
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axiosInstance.get("/api/student/assignments");
        setAssignments(res.data?.assignments || []);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      }
    };
    fetchAssignments();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB");

  const bg = isDark ? "#0F172A" : "#F7F7F7";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#111";
  const subTextColor = isDark ? "#94A3B8" : "#555";
  const borderColor = isDark ? "#334155" : "#ddd";

  return (
    <div
      style={{
        background: bg,
        color: textColor,
        minHeight: "100vh",
        padding: "24px",
        transition: "0.3s",
      }}
    >
      <h3 className="fw-bold mb-24" style={{ fontSize: '18px' }}>My Assignments</h3>

      {assignments.length === 0 ? (
        <p style={{ color: subTextColor }}>No assignments found</p>
      ) : (
        <div className="accordion" id="assignmentAccordion">
          {assignments.map((a, i) => (
            <div
              key={a._id}
              className="accordion-item mb-3"
              style={{
                background: cardBg,
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <h2 className="accordion-header" id={`heading${i}`}>
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${i}`}
                  style={{
                    background: cardBg,
                    color: textColor,
                    boxShadow: "none",
                  }}
                >
                  <Icon icon="mdi:clipboard-text" className="me-2" />
                  {a.title}
                </button>
              </h2>

              <div
                id={`collapse${i}`}
                className="accordion-collapse collapse"
                data-bs-parent="#assignmentAccordion"
              >
                <div className="accordion-body">
                  <p style={{ color: subTextColor }}>
                    <strong>Course:</strong> {a.course?.title}
                  </p>

                  <p style={{ color: subTextColor }}>
                    <strong>Description:</strong> {a.description}
                  </p>
                  {a.attachments && (
                    <p>
                      <strong>Attachment:</strong>{" "}
                      <a
                        href={a.attachments}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm ms-2"
                        style={{
                          background: "#3B82F6",
                          color: "#fff",
                          padding: "6px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        
                        View Assignment
                      </a>
                    </p>
                  )}

                  <p style={{ color: subTextColor }}>
                    <strong>Due Date:</strong> {formatDate(a.dueDate)}
                  </p>

                  <p style={{ color: subTextColor }}>
                    <strong>Max Marks:</strong> {a.maxMarks}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {a.submitted ? (
                      <span style={{ color: "#22C55E" }}>Submitted</span>
                    ) : (
                      <span style={{ color: "#EF4444" }}>Pending</span>
                    )}
                  </p>

                  {a.submitted && (
                    <>
                      <p>
                        <strong>Marks Obtained:</strong>{" "}
                        {a.marksObtained ?? "Not graded"}
                      </p>

                      {a.submissionUrl && (
                        <a
                          href={a.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                          style={{ background: "#FEBA01", color: "#000" }}
                        >
                          View Submission
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
