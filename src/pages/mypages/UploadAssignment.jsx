import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const UploadAssignment = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const getAllCourses = async () => {
      try {
        const res = await axiosInstance.get("/api/teacher/courses");
        setCourses(res.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    getAllCourses();
  }, []);

  /* ================= THEME ================= */
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

  /* ================= FORM ================= */
  const initialValues = {
    assignmentName: "",
    assignedCourses: "",
    document: null,
    duration: "",
    totalMarks: "",
    dueDate: "",
  };

  const validationSchema = Yup.object({
    assignmentName: Yup.string().required("Assignment name is required"),
    assignedCourses: Yup.string().required("Course is required"),
    document: Yup.mixed().required("Document is required"),
    duration: Yup.string().required("Duration is required"),
    totalMarks: Yup.number()
      .typeError("Total marks must be a number")
      .required("Total marks are required"),
    dueDate: Yup.date().required("Due date is required"),
  });

  /* ================= SUBMIT (FormData) ================= */
  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.assignmentName);
      formData.append("description", `Duration: ${values.duration}`);
      formData.append("courseId", values.assignedCourses);
      formData.append("dueDate", values.dueDate);
      formData.append("totalMarks", values.totalMarks);
      formData.append("attachment", values.document);

      await axiosInstance.post(
        "/api/teacher/assignments",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetForm();
      navigate("/assignments");
    } catch (error) {
      console.error(error);
      // ErrorToast("❌ Failed to upload assignment");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLES ================= */
  const formContainer = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    padding: "20px",
    margin: "20px auto",
    borderRadius: "12px",
    boxShadow: isDark ? "0 2px 6px #0008" : "0 2px 6px #0001",
    color: isDark ? "#E2E8F0" : "#111",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${isDark ? "#334155" : "#ccc"}`,
    background: isDark ? "#1E293B" : "#fff",
    color: isDark ? "#E2E8F0" : "#111",
  };

  const labelStyle = {
    fontWeight: "600",
    marginBottom: "4px",
    display: "block",
  };

  const errorStyle = {
    color: "#EF4444",
    fontSize: "12px",
  };

  return (
    <div className="container mx-auto p-20" style={formContainer}>
      <h2 style={{ fontSize: "20px", marginBottom: "18px" }}>
        Upload New Assignment
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignment Name */}
            <div>
              <label style={labelStyle}>Assignment Name *</label>
              <Field name="assignmentName" style={inputStyle} />
              <ErrorMessage name="assignmentName" component="div" style={errorStyle} />
            </div>

            {/* Course */}
            <div>
              <label style={labelStyle}>Assign Course *</label>
              <Field as="select" name="assignedCourses" style={inputStyle}>
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="assignedCourses" component="div" style={errorStyle} />
            </div>

            {/* Document */}
            <div>
              <label style={labelStyle}>Document *</label>
              <input
                type="file"
                style={inputStyle}
                onChange={(e) =>
                  setFieldValue("document", e.currentTarget.files[0])
                }
              />
              <ErrorMessage name="document" component="div" style={errorStyle} />
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle}>Duration *</label>
              <Field name="duration" placeholder="e.g. 7 days" style={inputStyle} />
              <ErrorMessage name="duration" component="div" style={errorStyle} />
            </div>

            {/* Total Marks */}
            <div>
              <label style={labelStyle}>Total Marks *</label>
              <Field name="totalMarks" type="number" style={inputStyle} />
              <ErrorMessage name="totalMarks" component="div" style={errorStyle} />
            </div>

            {/* Due Date */}
            <div>
              <label style={labelStyle}>Due Date *</label>
              <Field name="dueDate" type="date" style={inputStyle} />
              <ErrorMessage name="dueDate" component="div" style={errorStyle} />
            </div>

            {/* Button */}
            <div className="md:col-span-2 mt-3">
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#FEBA01",
                  fontWeight: "700",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {loading ? "Uploading..." : "Upload Assignment"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UploadAssignment;
