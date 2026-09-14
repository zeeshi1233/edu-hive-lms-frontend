import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  /* ================= STYLES ================= */
  const pageBg = isDark ? "#0F172A" : "#f5f6fa";
  const cardBg = isDark ? "#1E293B" : "#fff";
  const textColor = isDark ? "#E2E8F0" : "#111";
 

  if (loading) return <SkeletonProfile isDark={isDark} />;

  return (
    <div
      style={{
        backgroundColor: pageBg,
        minHeight: "100vh",
        padding: "40px 0",
        transition: "0.3s",
      }}
    >
      <div className="container">
        <div
          className="card shadow-lg p-5"
          style={{
            backgroundColor: cardBg,
            borderRadius: "16px",
            transition: "0.3s",
          }}
        >
          {/* ================= TOP PROFILE ================= */}
          <div className="d-flex align-items-center mb-5">
            <img
              src={user.profileImage}
              alt="Profile"
              className="rounded-circle border border-3 border-primary me-4"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
              }}
            />

            <div>
              <h2 className="fw-bold mb-1" style={{ color: textColor }}>
                {user.name}
              </h2>
              <p style={{ color: textColor, margin: 0 }}>
                {user.role?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* ================= PROFILE INFO ================= */}
          <div className="row g-3">
            <ProfileField label="Full Name" value={user.name} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.phone} />
            <ProfileField label="Gender" value={user.gender} />
            <ProfileField
              label="Date of Birth"
              value={formatDate(user.dateOfBirth)}
            />
            <ProfileField label="Address" value={user.address} />
            <ProfileField label="Guardian Name" value={user.guardianName} />
            <ProfileField
              label="Guardian Phone"
              value={user.guardianPhone}
            />
            <ProfileField label="Batch Timing" value={user.batchTiming} />
            <ProfileField label="Fee Plan" value={user.feePlan} />
            <ProfileField
              label="Total Fees"
              value={`Rs. ${user.totalFees}`}
            />
            <ProfileField
              label="Fee Paid"
              value={`Rs. ${user.feePaid}`}
            />
            <ProfileField
              label="Admission Date"
              value={formatDate(user.admissionDate)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE FIELD ================= */
const ProfileField = ({ label, value }) => (
  <div className="col-md-6">
    <label className="form-label fw-semibold">{label}</label>
    <input
      type="text"
      className="form-control"
      value={value || "-"}
      readOnly
    />
  </div>
);

/* ================= SKELETON ================= */
const SkeletonProfile = ({ isDark }) => {
  const sk = isDark ? "#334155" : "#e5e7eb";
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: sk,
          margin: "0 auto 20px",
        }}
      />
      <div
        style={{
          height: "16px",
          width: "200px",
          background: sk,
          borderRadius: "6px",
          margin: "0 auto",
        }}
      />
    </div>
  );
};

export default StudentProfile;
