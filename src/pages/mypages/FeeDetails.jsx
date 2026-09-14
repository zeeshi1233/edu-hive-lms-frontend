import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import LmsFilterBar from "../../components/common/LmsFilterBar";
import LmsAsyncState from "../../components/common/LmsAsyncState";

export default function FeeDetails() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/api/student/payments");
      const payments = response.data.payments || [];
      const history = payments.map((p) => ({
        _id: p._id,
        rawDate: p.createdAt,
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: p.amount,
        method: p.paymentMethod || "Online Transfer",
        status: p.status === "success" || p.status === "Paid" ? "Paid" : "Pending",
      }));
      setPaymentHistory(history);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Failed to load fee details");
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredPayments = paymentHistory.filter((h) => {
    if (startDate && h.rawDate && new Date(h.rawDate) < new Date(startDate)) {
      return false;
    }
    if (endDate && h.rawDate && new Date(h.rawDate) > new Date(endDate)) {
      return false;
    }
    if (
      selectedStatus &&
      h.status.toLowerCase() !== selectedStatus.toLowerCase()
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const methodMatch = h.method?.toLowerCase().includes(q);
      const amountMatch = String(h.amount).includes(q);
      const dateMatch = h.date?.toLowerCase().includes(q);
      if (!methodMatch && !amountMatch && !dateMatch) return false;
    }
    return true;
  });

  const bg = isDark ? "#0F172A" : "#F2F5F9";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#111";
  const borderColor = isDark ? "#334155" : "#DDD";
  const tableHeaderBg = isDark ? "#334155" : "#FEBA01";
  const tableHeaderText = "#fff";
  const tableRowHover = isDark ? "#334155" : "#F3F4F6";

  const statusOptions = [
    { label: "Paid Payments", value: "Paid" },
    { label: "Pending Verification", value: "Pending" },
  ];

  return (
    <div
      style={{
        background: bg,
        color: textColor,
        minHeight: "100%",
        padding: "24px",
        transition: "0.3s",
      }}
    >
      {/* Header */}
      <div className="mb-24">
        <h5 className="fw-semibold mb-1" style={{ color: textColor }}>
          Semester Fee Details & Transactions
        </h5>
        <p style={{ color: textColor, opacity: 0.7 }}>
          View semester fee vouchers, payment history, and status filters.
        </p>
      </div>

      {/* Filter Bar */}
      <LmsFilterBar
        title="Transactions Filtration"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Payment History Table */}
      <div
        style={{
          background: cardBg,
          borderRadius: "18px",
          padding: "20px",
          transition: "0.3s",
        }}
      >
        <LmsAsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && filteredPayments.length === 0}
          loadingLabel="Loading fee transactions..."
          emptyTitle="No payments found"
          emptyMessage="No fee transactions match the selected filters."
          emptyIcon="solar:wallet-money-bold-duotone"
          onRetry={fetchPayments}
          minHeight={200}
        >
        <div className="table-responsive">
          <table
            style={{ width: "100%", borderCollapse: "collapse", color: textColor }}
          >
            <thead
              style={{ background: tableHeaderBg, color: tableHeaderText }}
            >
              <tr>
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: `2px solid ${borderColor}`,
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: `2px solid ${borderColor}`,
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: `2px solid ${borderColor}`,
                  }}
                >
                  Payment Method
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: `2px solid ${borderColor}`,
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((h, i) => (
                <tr
                  key={i}
                  style={{
                    transition: "0.3s",
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = tableRowHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = cardBg)
                  }
                >
                  <td style={{ padding: "12px 16px" }}>{h.date}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                    Rs {h.amount}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{h.method}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: h.status === "Paid" ? "#16A34A" : "#FBBF24",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </LmsAsyncState>
      </div>
    </div>
  );
}
