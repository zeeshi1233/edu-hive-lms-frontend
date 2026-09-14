import React from "react";

const TeacherReviews = () => {
  const teacherReviews = [
  {
    id: 1,
    source: "Student",
    reviewType: "Teacher Feedback",
    reviewer: "Anonymous Student",
    subject: "Data Structures",
    rating: 4.5,
    message: "Sir explains concepts clearly with practical examples.",
    date: "14 Sep 2025",
    sentiment: "positive",
  },
  {
    id: 2,
    source: "Student",
    reviewType: "Course Feedback",
    reviewer: "Anonymous Student",
    subject: "OOP",
    rating: 3,
    message: "Course is good but quizzes are frequent.",
    date: "11 Sep 2025",
    sentiment: "neutral",
  },
  {
    id: 3,
    source: "Admin",
    reviewType: "Internal Remark",
    reviewer: "Admin Office",
    subject: null,
    rating: null,
    message: "Some students reported late quiz submissions this month.",
    date: "08 Sep 2025",
    sentiment: "warning",
  },
];

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="mb-20">
            <h5 className="fw-bold mb-4">Reviews & Feedback</h5>
            <span className="text-sm text-secondary-light">
              Feedback from students and admin
            </span>
          </div>

          <div className="d-flex flex-column gap-16">
            {teacherReviews.map((review) => (
              <div key={review.id} className="border rounded-12 p-16">
                <div className="d-flex justify-content-between align-items-start mb-8">
                  <div>
                    <span className="text-sm fw-medium">{review.reviewType}</span>
                    <h6 className="fw-semibold mb-0">{review.reviewer}</h6>
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

                {review.rating && (
                  <div className="text-sm fw-medium mb-8">
                    Rating: {review.rating} / 5
                  </div>
                )}

                <p className="text-sm mb-12">{review.message}</p>

                <div className="text-xs text-secondary-light">{review.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReviews;
