import React, { useEffect, useState } from "react";
import StatesAdmin from "../../components/mycomponents/admin/StatesAdmin";
import NumberOfClassesChart from "../../components/mycomponents/admin/NumberOfClassesChart";

const AdminDashboard = () => {
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

  const textColor = isDark ? "#F8FAFC" : "#0F172A";

  return (
    <div className="lms-page d-flex flex-column gap-4">
      <div>
        <span className="lms-kicker">Administration</span>
        <h3 className="lms-page-title mb-2" style={{ color: textColor }}>
          Admin Overview & Analytics
        </h3>
        <p className="lms-page-subtitle mb-0">
          Monitor students, teaching staff, the course catalog, and scheduled classes.
        </p>
      </div>

      <StatesAdmin />

      <NumberOfClassesChart />
    </div>
  );
};

export default AdminDashboard;
