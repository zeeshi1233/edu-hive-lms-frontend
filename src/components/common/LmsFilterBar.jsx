import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function LmsFilterBar({
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
  courses = [],
  selectedCourse = "",
  setSelectedCourse,
  statusOptions = [],
  selectedStatus = "",
  setSelectedStatus,
  searchQuery = "",
  setSearchQuery,
  onReset,
  title = "Filter Data",
  actions = null,
  extraFilters = null,
  courseLabel = "Course / Subject",
  hideStatus = false,
}) {
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

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#1F2937";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const inputBg = isDark ? "#0F172A" : "#F8FAFC";

  const hasActiveFilters =
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(selectedCourse) ||
    Boolean(selectedStatus) ||
    Boolean(searchQuery);

  const handleClearAll = () => {
    if (setStartDate) setStartDate("");
    if (setEndDate) setEndDate("");
    if (setSelectedCourse) setSelectedCourse("");
    if (setSelectedStatus) setSelectedStatus("");
    if (setSearchQuery) setSearchQuery("");
    if (onReset) onReset();
  };

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "18px 22px",
        marginBottom: "24px",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.4)"
          : "0 4px 20px rgba(0, 0, 0, 0.04)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Top Header Row */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(254, 186, 1, 0.15)",
              color: "#FEBA01",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="solar:filter-bold-duotone" width="22" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: textColor }}>
              {title}
            </h6>
            <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
              Filter by date, course, status, or search keywords
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                background: isDark ? "#334155" : "#F1F5F9",
                color: isDark ? "#F8FAFC" : "#475569",
                borderRadius: "8px",
                border: "none",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <Icon icon="solar:restart-bold" width="16" /> Reset Filters
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="row g-3 align-items-end">
        {/* Search Bar */}
        {setSearchQuery !== undefined && (
          <div className="col-lg-3 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: textColor,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Search
            </label>
            <div className="position-relative">
              <Icon
                icon="solar:magnifer-linear"
                width="18"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isDark ? "#94A3B8" : "#94A3B8",
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 36px 9px 38px",
                  borderRadius: "10px",
                  border: `1px solid ${borderColor}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: isDark ? "#94A3B8" : "#94A3B8",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <Icon icon="radix-icons:cross-2" width="16" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Date Range Inputs */}
        {(setStartDate !== undefined || setEndDate !== undefined) && (
          <div className="col-lg-4 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: textColor,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Date Range
            </label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate && setStartDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: `1px solid ${borderColor}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <span style={{ color: isDark ? "#64748B" : "#94A3B8", fontSize: "12px" }}>
                to
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate && setEndDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: `1px solid ${borderColor}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        {/* Course Filter Dropdown */}
        {setSelectedCourse !== undefined && (
          <div className="col-lg-2 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: textColor,
                marginBottom: "6px",
                display: "block",
              }}
            >
              {courseLabel}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">
                {courseLabel.toLowerCase().includes("board")
                  ? "All Boards"
                  : courseLabel.toLowerCase() === "course"
                  ? "All Courses"
                  : `All ${courseLabel}`}
              </option>
              {courses.map((c, i) => {
                const val = typeof c === "string" ? c : c._id || c.title;
                const label = typeof c === "string" ? c : c.title || c.name;
                return (
                  <option key={i} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Status Dropdown */}
        {setSelectedStatus !== undefined && !hideStatus && (
          <div className="col-lg-3 col-md-6 col-12">
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: textColor,
                marginBottom: "6px",
                display: "block",
              }}
            >
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt, i) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return (
                  <option key={i} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {extraFilters}
      </div>
    </div>
  );
}
