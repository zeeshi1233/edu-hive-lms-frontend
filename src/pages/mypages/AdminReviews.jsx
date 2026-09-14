import React from "react";

const AdminReviews = () => {
  const reviews = [
  {
    id: 1,
    type: "Student → Teacher",
    reviewer: "Ali Raza (CS-21-045)",
    target: "Sir Bilal Ahmed",
    subject: "Data Structures",
    rating: 4.5,
    message:
      "Sir explains concepts very clearly and is always on time. More practical examples would help.",
    date: "12 Sep 2025",
    sentiment: "positive",
    status: "Visible",
  },
  {
    id: 2,
    type: "Student → Course",
    reviewer: "Sara Ahmed (CS-21-052)",
    target: "Database Systems",
    subject: null,
    rating: 3,
    message:
      "Course content is good but assignments are a bit heavy for the given time.",
    date: "10 Sep 2025",
    sentiment: "neutral",
    status: "Visible",
  },
  {
    id: 3,
    type: "Teacher → Student",
    reviewer: "Sir Usama Ali",
    target: "Hassan Ali (CS-21-073)",
    subject: "Web Engineering",
    rating: null,
    message:
      "Student has low attendance and often misses quizzes. Needs counseling.",
    date: "08 Sep 2025",
    sentiment: "negative",
    status: "Flagged",
  },
];

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="mb-20">
            <h5 className="fw-bold mb-4">Reviews & Feedback</h5>
            <span className="text-sm text-secondary-light">
              Monitor student and teacher feedback across the LMS
            </span>
          </div>

          <div className="d-flex flex-column gap-16">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-12 p-16"
              >
                <div className="d-flex justify-content-between align-items-start mb-8">
                  <div>
                    <span className="text-sm fw-medium">
                      {review.type}
                    </span>
                    <h6 className="fw-semibold mb-0">
                      {review.reviewer}
                      <span className="text-secondary-light">
                        {" "}→ {review.target}
                      </span>
                    </h6>
                  </div>

                  <span
                    className={`px-12 py-4 rounded-pill text-sm fw-medium ${
                      review.sentiment === "positive"
                        ? "bg-success-focus text-success-main"
                        : review.sentiment === "neutral"
                        ? "bg-warning-focus text-warning-main"
                        : "bg-danger-focus text-danger-main"
                    }`}
                  >
                    {review.sentiment}
                  </span>
                </div>

                {review.subject && (
                  <div className="text-sm text-secondary-light mb-8">
                    Subject: {review.subject}
                  </div>
                )}

                <p className="text-sm mb-12">
                  {review.message}
                </p>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-xs text-secondary-light">
                    {review.date}
                  </span>

                  <div className="d-flex gap-8">
                    <button className="btn btn-light btn-sm">
                      View
                    </button>
                    <button className="btn btn-outline-danger btn-sm">
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
