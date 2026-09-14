import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const TeacherProfile = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= THEME ================= */
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

  /* ================= API ================= */
  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .finally(() => setLoading(false));
  }, []);

  /* ================= COLORS ================= */
  const bg = isDark ? "#0F172A" : "#f4f6fb";
  const card = isDark ? "#1E293B" : "#ffffff";
  const text = isDark ? "#E5E7EB" : "#111827";
  const muted = isDark ? "#9CA3AF" : "#6B7280";
  const accent = "#facc15";

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "30px 0" }}>
      <div className="container">
        <div className="row g-4">
          {/* ================= LEFT ================= */}
          <div className="col-lg-4">
            <div
              className="card border-0 p-10"
              style={{
                background: card,
                borderRadius: "18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div className="card-body p-4 text-center">
                {loading ? (
                  <SkeletonProfile isDark={isDark} />
                ) : (
                  <>
                    <img
                      src={user.profileImage}
                      alt="profile"
                      className="rounded-circle mb-3"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                        border: `4px solid ${accent}`,
                      }}
                    />

                    <h4 style={{ color: text }}>{user.name}</h4>
                    <p style={{ color: muted }}>{user.email}</p>

                    <span
                      className="badge px-3 py-2"
                      style={{
                        background: accent,
                        color: "#000",
                        borderRadius: "20px",
                        fontSize: "13px",
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>

                    <hr style={{ borderColor: muted, opacity: 0.3 }} />

                    <div className="text-start mt-3">
                      <p style={{ color: muted }}>📞 {user.phone}</p>
                      <p style={{ color: muted }}>👤 {user.gender}</p>
                      <p style={{ color: muted }}>
                        📅 Joined:{" "}
                        {new Date(user.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="col-lg-8">
            <div
              className="card border-0  p-10  " 
              style={{
                background: card,
                borderRadius: "18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div className="card-body p-4">
                <h5 style={{ color: text, marginBottom: "20px" }}>
                  Professional Information
                </h5>

                <div className="row g-4">
                  {loading ? (
                    <>
                      <SkeletonInfo />
                      <SkeletonInfo />
                      <SkeletonInfo />
                      <SkeletonInfo />
                      <SkeletonInfo />
                      <SkeletonInfo />
                    </>
                  ) : (
                    <>
                      <Info label="Qualification" value={user.qualification} />
                      <Info label="Specialization" value={user.specialization} />
                      <Info
                        label="Experience"
                        value={`${user.experienceYears} Years`}
                      />
                      <Info label="Salary Type" value={user.salaryType} />
                      <Info label="Availability" value={user.availability} />
                      <Info
                        label="Status"
                        value={user.isActive ? "Active" : "Inactive"}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= INFO CARD ================= */
const Info = ({ label, value }) => (
  <div className="col-md-6">
    <div
      style={{
        padding: "14px",
        borderRadius: "12px",
        background: "rgba(148,163,184,0.08)",
      }}
    >
      <small style={{ color: "#9CA3AF", fontWeight: 600 }}>{label}</small>
      <div style={{ fontWeight: 600, marginTop: "4px" }}>{value}</div>
    </div>
  </div>
);

/* ================= SKELETONS ================= */
const SkeletonProfile = ({ isDark }) => {
  const sk = isDark ? "#334155" : "#e5e7eb";
  return (
    <>
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: sk,
          margin: "0 auto 20px",
        }}
      />
      <div style={{ height: "16px", background: sk, borderRadius: "6px" }} />
      <div
        style={{
          height: "14px",
          background: sk,
          borderRadius: "6px",
          marginTop: "10px",
        }}
      />
    </>
  );
};

const SkeletonInfo = () => (
  <div className="col-md-6">
    <div
      style={{
        height: "60px",
        borderRadius: "12px",
        background: "rgba(148,163,184,0.15)",
      }}
    />
  </div>
);

export default TeacherProfile;
