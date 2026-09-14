import React, { useState, useEffect } from "react";
import SessionHistory from "../../components/mycomponents/teacher/SessionHistory";

export default function TeacherPaySlip() {
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

  const dummyData = [
    { name: 'Ali Khan', sessions: 5, hours: 10, rate: 'AED 50', amount: 'AED 500' },
    { name: 'Sara Ahmed', sessions: 3, hours: 6, rate: 'AED 50', amount: 'AED 300' },
    { name: 'Hassan Raza', sessions: 4, hours: 8, rate: 'AED 50', amount: 'AED 400' },
    { name: 'Sara Ahmed', sessions: 3, hours: 6, rate: 'AED 50', amount: 'AED 300' },
    { name: 'Hassan Raza', sessions: 4, hours: 8, rate: 'AED 50', amount: 'AED 400' },
    { name: 'Ali Khan', sessions: 5, hours: 10, rate: 'AED 50', amount: 'AED 500' },
  ];

  const bgColor = isDark ? "#0F172A" : "#fff";
  const textColor = isDark ? "#E2E8F0" : "#000";
  const subTextColor = isDark ? "#CBD5E1" : "#555";
  const cardBg = isDark ? "#1E293B" : "#fff";
  const cardBorder = isDark ? "#334155" : "#f0f0f0";
  const highlightColor = "#e6b800";

  return (
    <div style={{ fontFamily: "sans-serif", color: textColor, margin: '0 auto', padding: '20px', background: bgColor, minHeight: '100vh', transition: '0.3s' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h3 style={{ color: highlightColor, fontSize: '22px', fontWeight: '700' }}>
          Your Earnings for November 2025
        </h3>
        <p style={{ color: subTextColor, fontSize: '14px', maxWidth: '500px', margin: '10px auto' }}>
          Verify your earnings and report any issues by the 2nd of the month. Changes won’t be possible after settlement.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <h4 style={{ color: highlightColor, fontWeight: '700', fontSize: '20px' }}>AED 0.00</h4>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        {['Conducted', 'Cancelled', 'Teacher Absent', 'Upcoming Sessions'].map((label, i) => (
          <div key={i} style={{ flex: '1 1 200px' }}>
            <div
              style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${cardBorder}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '140px',
                transition: '0.3s',
                boxShadow: isDark
                  ? "0 4px 25px rgba(0,0,0,0.45)"
                  : "0 2px 8px rgba(0,0,0,0.1)"
              }}
              className="stat-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <p style={{ fontWeight: '600', fontSize: '14px', color: textColor, margin: 0 }}>{label}</p>
              </div>
              <h5 style={{ fontWeight: '700', fontSize: '20px', margin: 0, color: highlightColor }}>{0}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Section */}
      <div style={{
        background: cardBg,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${cardBorder}`,
        marginBottom: '40px',
        boxShadow: isDark
          ? "0 4px 25px rgba(0,0,0,0.45)"
          : "0 2px 8px rgba(0,0,0,0.1)",
        transition: '0.3s'
      }}>
        <h6 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', color: textColor }}>Upcoming Payment</h6>
        <p style={{ color: highlightColor, fontWeight: '600', fontSize: '18px', marginBottom: '10px' }}>AED 0</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <small style={{ color: subTextColor, marginRight: '10px' }}>Feb 28th, 2025</small>
          <span style={{ background: '#dc3545', color: '#fff', padding: '5px 10px', borderRadius: '12px', fontSize: '12px' }}>Pending</span>
        </div>
      </div>

      {/* Session History & Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Session History */}
        <div style={{ flex: '1 1 400px' }}>
          <SessionHistory />
        </div>

        {/* Session Count Summary */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark
              ? "0 4px 25px rgba(0,0,0,0.45)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: '0.3s'
          }}>
            <h5 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '10px', color: textColor }}>Session Count Summary</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: textColor }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Student Name</th>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Sessions</th>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Hours</th>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Rate</th>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((student, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px 0' }}>{student.name}</td>
                    <td style={{ padding: '8px 0' }}>{student.sessions}</td>
                    <td style={{ padding: '8px 0' }}>{student.hours}</td>
                    <td style={{ padding: '8px 0' }}>{student.rate}</td>
                    <td style={{ padding: '8px 0' }}>{student.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{` 
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark
            ? "0 6px 20px rgba(0,0,0,0.6)"
            : "0 6px 16px rgba(0,0,0,0.15)"};
          transition: 0.3s;
        }
      `}</style>
    </div>
  );
}
