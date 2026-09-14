import React from "react";
import OngoingClasses from "../../components/mycomponents/teacher/OngoingClasses";
import Enrollments from "../../components/mycomponents/teacher/Enrollments";
import SessionHistory from "../../components/mycomponents/teacher/SessionHistory";
import SessionsList from "../../components/mycomponents/teacher/SessionsList";
import TeacherState from "../../components/mycomponents/teacher/TeacherState";


const TeacherDashboard = () => {
  return (
    <div className="container-fluid mt-3">

      {/* Top Cards */}
      <TeacherState />

      {/* Ongoing Class */}
      <div className="mt-5">
        <OngoingClasses />
      </div>

      {/* Enrollments + Sessions History */}
      <div className="row mt-20">
        <div className="col-lg-6">
          <Enrollments />
        </div>

        <div className="col-lg-6">
          <SessionHistory />
        </div>
      </div>

      {/* Sessions List */}
      <div className="mt-20">
        <SessionsList viewAll={true} />
      </div>
    </div>
  );
};

export default TeacherDashboard;
