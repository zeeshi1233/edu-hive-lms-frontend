import React, { useState, useEffect } from "react";

const AdminProfile = () => {
  const user = {
    name: "Admin",
    email: "admin@gmail.com",
    phone: "+92 3128955456",
    image: "https://placehold.co/150x150", // Replace with actual image
  };

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

  const pageBg = isDark ? "#0F172A" : "#f5f6fa";
  const cardBg = isDark ? "#1E293B" : "#fff";
  const textColor = isDark ? "#E2E8F0" : "#111";
  const inputBg = isDark ? "#111827" : "#fff";
  const inputColor = isDark ? "#E2E8F0" : "#111";
  const borderColor = isDark ? "#374151" : "#ced4da";

  return (
    <div
      className="w-100"
      style={{ backgroundColor: pageBg, minHeight: "100vh", transition: "0.3s" }}
    >
      <div className="container py-5">
        <div
          className="card shadow-lg radius-16 p-5"
          style={{
            backgroundColor: cardBg,
            transition: "0.3s",
          }}
        >
          {/* Top Row: Profile Pic */}
          <div className="d-flex align-items-center mb-4">
            <img
              src={user.image}
              alt="Profile"
              className="rounded-circle border border-3 border-primary me-4"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
            <div>
              <h2 className="fw-bold mb-2" style={{ color: textColor }}>
                {user.name}
              </h2>
              <p style={{ color: textColor, margin: 0 }}>{user.department}</p>
              <p style={{ color: textColor, margin: 0 }}>{user.semester}</p>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="row g-3 mt-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: textColor }}>
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                value={user.name}
                readOnly
                style={{
                  backgroundColor: inputBg,
                  color: inputColor,
                  borderColor: borderColor,
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: textColor }}>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                readOnly
                style={{
                  backgroundColor: inputBg,
                  color: inputColor,
                  borderColor: borderColor,
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: textColor }}>
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                value={user.phone}
                readOnly
                style={{
                  backgroundColor: inputBg,
                  color: inputColor,
                  borderColor: borderColor,
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
