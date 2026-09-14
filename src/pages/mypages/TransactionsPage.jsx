import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";


export default function TransactionsPage() {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= THEME LISTENER ================= */
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

  /* ================= GET TRANSACTIONS ================= */
  const getTransactions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/api/teacher/session-transactions"
      );
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  /* ================= HELPERS ================= */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const badgeStyle = (type) => ({
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "8px",
    color: "#fff",
    background:
      type === "completed"
        ? "#16A34A"
        : type === "pending"
        ? "#F59E0B"
        : "#6B7280",
  });

  const containerStyle = {
    background: isDark ? "#0F172A" : "#fff",
    minHeight: "100vh",
    padding: "40px 20px",
    transition: "0.3s",
  };

  const titleStyle = {
    fontSize: "34px",
    fontWeight: "500",
    color: isDark ? "#E2E8F0" : "#000",
    marginBottom: "20px",
  };

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    marginBottom: "12px",
    borderRadius: "12px",
    background: isDark ? "#1E293B" : "#fffceb",
    color: isDark ? "#E2E8F0" : "#000",
    border: `1px solid ${isDark ? "#334155" : "#f0e6c2"}`,
  };

  return (
    <div style={containerStyle}>
      <span style={titleStyle}>Transactions</span>

     {!loading && transactions.length === 0 && (
  <div
    className="d-flex flex-column align-items-center justify-content-center"
    style={{
      marginTop: "80px",
      color: isDark ? "#94A3B8" : "#64748B",
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: isDark ? "#1E293B" : "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
      }}
    >
      <span style={{ fontSize: "32px" }}>💳</span>
    </div>

    <h6 className="fw-semibold mb-1">No transactions found</h6>
    <p style={{ fontSize: "13px" }}>
      You don’t have any transaction history yet.
    </p>
  </div>
)}

      {!loading &&
        transactions.map((item) => (
          <div key={item._id} style={cardStyle}>
            {/* Date */}
            <div style={{ width: "120px" }}>
              <p className="fw-bold mb-0" style={{ fontSize: "13px" }}>
                {formatDate(item.createdAt)}
              </p>
            </div>

            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", width: "180px" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: isDark ? "#334155" : "#6B7280",
                }}
              ></div>
              <div style={{ marginLeft: "8px" }}>
                <p className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                  {item.user?.name}
                </p>
                <span style={{ fontSize: "12px", color: "#FACC15" }}>
                  {item.user?.email}
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ width: "120px", fontSize: "13px" }}>
              <span className="fw-bold">INFO: </span>
              {item.paymentMethod}
            </div>

            {/* Subject */}
            <div style={{ width: "150px", fontSize: "13px" }}>
              <span className="fw-bold">Subject: </span>
              {item.course?.title || "—"}
            </div>

            {/* Status */}
            <div style={{ width: "120px" }}>
              <span style={badgeStyle(item.status)}>
                {item.status}
              </span>
            </div>

            {/* Transaction Type */}
            <div style={{ width: "120px" }}>
              <span style={badgeStyle("completed")}>
                {item.type}
              </span>
            </div>

            {/* Session Date */}
            <div style={{ width: "150px", fontSize: "13px" }}>
              <span className="fw-bold">Time:</span>
              <br />
              {formatTime(item.createdAt)}
            </div>

            {/* Amount */}
            <div style={{ width: "100px", fontSize: "13px" }}>
              <span className="fw-bold">Amount:</span>
              <br />
              {item.amount}
            </div>

            {/* Remaining */}
            <div style={{ width: "100px", fontSize: "13px" }}>
              <span className="fw-bold">Remaining:</span>
              <br />
              {item.course?.price || 0}
            </div>

            {/* Delete */}
            <button
              className="btn btn-outline-dark btn-sm"
              style={{
                borderColor: isDark ? "#475569" : "#000",
                color: isDark ? "#E2E8F0" : "#000",
              }}
            >
              🗑️
            </button>
          </div>
        ))}
    </div>
  );
}
