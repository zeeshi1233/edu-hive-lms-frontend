import React from "react";

/**
 * Shared LMS loader for API-driven screens.
 * @param {"page"|"inline"|"overlay"|"button"} variant
 */
const LmsLoader = ({
  label = "Loading...",
  variant = "inline",
  className = "",
  style = {},
}) => {
  if (variant === "button") {
    return (
      <span className={`lms-loader-inline ${className}`.trim()} style={style}>
        <span className="lms-spinner lms-spinner-sm" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div className={`lms-loader-overlay ${className}`.trim()} style={style} role="status">
        <div className="lms-loader-card">
          <span className="lms-spinner" aria-hidden="true" />
          <p className="mb-0 fw-semibold">{label}</p>
        </div>
      </div>
    );
  }

  const shellClass =
    variant === "page" ? "lms-loader-page" : "lms-loader-inline-block";

  return (
    <div
      className={`${shellClass} ${className}`.trim()}
      style={style}
      role="status"
      aria-live="polite"
    >
      <span className="lms-spinner" aria-hidden="true" />
      <p className="mb-0 fw-semibold">{label}</p>
    </div>
  );
};

export default LmsLoader;
