import React from "react";

const MonthlyProgress = () => {
  const monthlyProgress = [
  {
    subject: "Data Structures",
    attendance: "92%",
    assignments: "4 / 5",
    quizScore: "85%",
    performance: "Excellent",
    status: "On Track",
    statusColor: "success",
  },
  {
    subject: "Object Oriented Programming",
    attendance: "78%",
    assignments: "3 / 5",
    quizScore: "70%",
    performance: "Good",
    status: "On Track",
    statusColor: "primary",
  },
  {
    subject: "Database Systems",
    attendance: "65%",
    assignments: "2 / 5",
    quizScore: "55%",
    performance: "Average",
    status: "Needs Improvement",
    statusColor: "warning",
  },
  {
    subject: "Web Engineering",
    attendance: "50%",
    assignments: "1 / 4",
    quizScore: "40%",
    performance: "Poor",
    status: "At Risk",
    statusColor: "danger",
  },
];

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex align-items-center justify-content-between mb-16">
            <h5 className="fw-bold mb-0">Monthly Academic Progress</h5>
            <span className="text-sm text-secondary-light">September 2025</span>
          </div>

          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="text-center">Attendance</th>
                  <th className="text-center">Assignments</th>
                  <th className="text-center">Quiz Avg</th>
                  <th className="text-center">Performance</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {monthlyProgress.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <h6 className="text-md mb-0 fw-medium">
                        {item.subject}
                      </h6>
                    </td>

                    <td className="text-center fw-medium">
                      {item.attendance}
                    </td>

                    <td className="text-center fw-medium">
                      {item.assignments}
                    </td>

                    <td className="text-center fw-medium">
                      {item.quizScore}
                    </td>

                    <td className="text-center">
                      <span className="fw-medium">
                        {item.performance}
                      </span>
                    </td>

                    <td className="text-center">
                      <span
                        className={`bg-${item.statusColor}-focus text-${item.statusColor}-main px-20 py-4 rounded-pill fw-medium text-sm`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProgress;
