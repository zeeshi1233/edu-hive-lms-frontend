import React from "react";
import SessionsList from "../../components/mycomponents/teacher/SessionsList";

const AllSessions = () => {
  return (
    <div className="lms-page">
      <div className="mb-4">
        <span className="lms-kicker">Scheduling</span>
        <h3 className="lms-page-title mb-1">All Sessions</h3>
        <p className="lms-page-subtitle mb-0">
          Filter by date, course, class type, and conducted status. Cancel or update sessions here.
        </p>
      </div>
      <SessionsList viewAll={false} />
    </div>
  );
};

export default AllSessions;
