import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import LmsFilterBar from "../../common/LmsFilterBar";
import LmsLoader from "../../common/LmsLoader";

export default function MyCourses() {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  // Theme listener
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

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/student/courses");
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter logic
  const filteredCourses = courses.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = c.title?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    if (selectedDuration) {
      if (selectedDuration === "short" && c.duration > 30) return false;
      if (selectedDuration === "long" && c.duration <= 30) return false;
    }
    return true;
  });

  const headerBg = isDark ? "#b9770e" : "#FEBA01";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const cardText = isDark ? "#E2E8F0" : "#111";
  const footerBorder = isDark ? "#334155" : "#DDD";
  const footerText = isDark ? "#E2E8F0" : "#000";
  const cardShadow = isDark
    ? "0 4px 25px rgba(0,0,0,0.35)"
    : "0 4px 20px rgba(0,0,0,0.08)";

  const durationOptions = [
    { label: "Short Courses (<= 30 hrs)", value: "short" },
    { label: "Full Programs (> 30 hrs)", value: "long" },
  ];

  if (loading) {
    return <LmsLoader label="Loading courses..." variant="page" />;
  }

  return (
    <div
      className="section p-24 radius-16 h-100"
      style={{
        background: isDark ? "#0F172A" : "#F2F5F9",
        transition: "0.3s ease-in-out",
      }}
    >
      <div className="mb-24 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3 className="text-xl fw-bold mb-0" style={{ color: cardText }}>
          My Enrolled Courses <span style={{ color: "#FEBA01" }}>(Fall Semester)</span>
        </h3>
        <span className="badge" style={{ background: "#FEBA01", color: "#000", fontSize: "13px" }}>
          {filteredCourses.length} Active Courses
        </span>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Courses Search & Filter"
        statusOptions={durationOptions}
        selectedStatus={selectedDuration}
        setSelectedStatus={setSelectedDuration}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {filteredCourses.length === 0 ? (
        <div className="text-center py-5">
          <Icon icon="solar:book-bookmark-bold" width="48" style={{ color: "#FEBA01" }} />
          <h5 className="mt-3" style={{ color: cardText }}>
            No matching courses found.
          </h5>
        </div>
      ) : (
        <div className="row gy-4 cursor-pointer">
          {filteredCourses.map((c) => (
            <div className="col-lg-6 col-md-12 d-flex" key={c._id}>
              <Link to={`/assigments`} className="text-decoration-none w-100">
                <div
                  className="card radius-16 border d-flex flex-column flex-fill"
                  style={{
                    height: "100%",
                    background: cardBg,
                    boxShadow: cardShadow,
                    transition: "0.3s",
                    overflow: "hidden",
                    color: cardText,
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-20 radius-top-16"
                    style={{
                      background: headerBg,
                      color: "#000",
                    }}
                  >
                    <h5 className="fw-semibold mb-2">{c?.title}</h5>
                    <p className="text-sm opacity-75 mb-0">
                      Duration: {c.duration || "40"} hrs
                    </p>
                  </div>

                  {/* Body */}
                  <div className="p-20 flex-grow-1">
                    <p className="text-sm opacity-75 mb-1">
                      Price: ${c.price || 150}
                    </p>
                    <p className="text-xs opacity-75">
                      Status: Enrolled & Active
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="p-16 d-flex justify-content-between text-center border-top"
                    style={{
                      borderColor: footerBorder,
                    }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <Icon
                        icon="mdi:book-open-variant"
                        fontSize={24}
                        style={{ color: "#FEBA01" }}
                      />
                      <span
                        className="text-xs mt-1"
                        style={{ color: footerText }}
                      >
                        Assignments & Work
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
