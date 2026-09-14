import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const FormPageHeader = ({ title, subtitle, backTo }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <div className="lms-form-header d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div>
        <h2 className="lms-page-title mb-1">{title}</h2>
        {subtitle ? <p className="lms-page-subtitle mb-0">{subtitle}</p> : null}
      </div>
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="lms-btn-ghost d-flex align-items-center gap-1"
          onClick={handleBack}
        >
          <Icon icon="solar:arrow-left-linear" width="18" />
          Back
        </button>
      </div>
    </div>
  );
};

export default FormPageHeader;
