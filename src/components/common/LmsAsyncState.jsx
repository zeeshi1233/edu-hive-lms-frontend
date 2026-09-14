import React from "react";
import { Icon } from "@iconify/react";
import LmsLoader from "./LmsLoader";

/**
 * Renders loading / error / empty / content for API-backed UI.
 */
const LmsAsyncState = ({
  loading = false,
  error = "",
  empty = false,
  loadingLabel = "Loading...",
  emptyTitle = "Nothing here yet",
  emptyMessage = "No records found.",
  emptyIcon = "solar:inbox-line-bold-duotone",
  onRetry,
  loaderVariant = "inline",
  minHeight = 180,
  children,
}) => {
  if (loading) {
    return (
      <LmsLoader
        label={loadingLabel}
        variant={loaderVariant}
        style={{ minHeight }}
      />
    );
  }

  if (error) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center px-3 py-4"
        style={{ minHeight }}
      >
        <Icon
          icon="solar:danger-triangle-bold-duotone"
          width="40"
          style={{ color: "#FEBA01" }}
        />
        <h6 className="fw-bold mt-3 mb-1">Something went wrong</h6>
        <p className="mb-3 text-muted" style={{ maxWidth: 420, fontSize: 14 }}>
          {error}
        </p>
        {onRetry && (
          <button type="button" className="lms-btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center px-3 py-4"
        style={{ minHeight }}
      >
        <Icon icon={emptyIcon} width="40" style={{ color: "#94A3B8" }} />
        <h6 className="fw-bold mt-3 mb-1">{emptyTitle}</h6>
        <p className="mb-0 text-muted" style={{ maxWidth: 420, fontSize: 14 }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return children;
};

export default LmsAsyncState;
