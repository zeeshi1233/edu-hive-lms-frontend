import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { notify } from "../../utils/notify";

const TeacherProfile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const loadUser = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/me");
      setUser(res.data.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (!googleStatus) return;

    if (googleStatus === "connected") {
      const email = searchParams.get("email");
      notify.success(
        email
          ? `Google account connected (${email}). New sessions will create Meet links.`
          : "Google account connected successfully."
      );
      loadUser();
    } else if (googleStatus === "error") {
      const reason = searchParams.get("reason") || "connection_failed";
      notify.error(`Google connect failed: ${reason}`);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("google");
    next.delete("email");
    next.delete("reason");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const connectGoogle = async () => {
    try {
      setGoogleLoading(true);
      const res = await axiosInstance.get("/api/teacher/google/auth");
      const authUrl = res.data?.authUrl;
      if (!authUrl) {
        notify.error("Could not start Google authorization");
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to connect Google account");
      setGoogleLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      setGoogleLoading(true);
      await axiosInstance.post("/api/teacher/google/disconnect");
      notify.success("Google account disconnected");
      await loadUser();
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to disconnect Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const bg = isDark ? "#0F172A" : "#f4f6fb";
  const card = isDark ? "#1E293B" : "#ffffff";
  const text = isDark ? "#E5E7EB" : "#111827";
  const muted = isDark ? "#9CA3AF" : "#6B7280";
  const accent = "#facc15";

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "30px 0" }}>
      <div className="container">
        <div className="row g-4">
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

          <div className="col-lg-8">
            <div
              className="card border-0 p-10"
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
                    </>
                  ) : (
                    <>
                      <Info label="Qualification" value={user.qualification} />
                      <Info
                        label="Experience"
                        value={`${user.experienceYears || 0} Years`}
                      />
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

            <div
              className="card border-0 p-10 mt-4"
              style={{
                background: card,
                borderRadius: "18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div className="card-body p-4">
                <h5 style={{ color: text, marginBottom: 8 }}>
                  Google Calendar & Meet
                </h5>
                <p style={{ color: muted, marginBottom: 18, fontSize: 14 }}>
                  Connect your Google account so EduHive can create official
                  Google Meet links when you schedule a class, and track
                  attendance via participant email.
                </p>

                {loading ? (
                  <SkeletonInfo />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "rgba(148,163,184,0.08)",
                      border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: text, fontSize: 14 }}>
                        {user.googleConnected ? "Connected" : "Not connected"}
                      </div>
                      <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
                        {user.googleConnected
                          ? user.googleEmail || "Google account linked"
                          : "Required to auto-generate Meet links for new sessions"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {user.googleConnected ? (
                        <>
                          <button
                            type="button"
                            className="lms-btn-primary lms-btn-sm"
                            disabled={googleLoading}
                            onClick={connectGoogle}
                          >
                            {googleLoading ? "Opening..." : "Reconnect"}
                          </button>
                          <button
                            type="button"
                            className="lms-btn-ghost lms-btn-sm"
                            disabled={googleLoading}
                            onClick={disconnectGoogle}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="lms-btn-primary lms-btn-sm"
                          disabled={googleLoading}
                          onClick={connectGoogle}
                          style={{ minWidth: 180 }}
                        >
                          {googleLoading ? "Opening Google..." : "Connect Google Account"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
