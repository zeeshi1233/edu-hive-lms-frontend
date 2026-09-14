import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";

const EditAssignment = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [courses, setCourses] = useState([]);
  const [assignment, setAssignment] = useState(state?.assignment || null);
  const [loading, setLoading] = useState(false);

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

  const getCourses = async () => {
    const res = await axiosInstance.get("/api/teacher/courses");
    setCourses(res.data.courses || []);
  };


const getAssignmentById = async (assignmentId) => {
  const res = await axiosInstance.get(
    `/api/teacher/assignments/${assignmentId}`
  );
  setAssignment(res.data.assignment);
};

  useEffect(() => {
  getCourses();
  if (!assignment && id) {
    getAssignmentById(id);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id, assignment]);



  if (!assignment) return <p className="text-center mt-5">Loading...</p>;

  /* ================= FORM ================= */
  const initialValues = {
    assignmentName: assignment.title,
    assignedCourses: assignment.course._id,
    duration: assignment.description?.replace("Duration:", "").trim(),
    totalMarks: assignment.maxMarks,
    dueDate: assignment.dueDate.split("T")[0],
  };

  const validationSchema = Yup.object({
    assignmentName: Yup.string().required("Assignment name is required"),
    assignedCourses: Yup.string().required("Course is required"),
    duration: Yup.string().required("Duration is required"),
    totalMarks: Yup.number().required("Total marks required"),
    dueDate: Yup.date().required("Due date is required"),
  });

  const onSubmit = async (values) => {
    const payload = {
      title: values.assignmentName,
      description: `Duration: ${values.duration}`,
      courseId: values.assignedCourses,
      dueDate: values.dueDate,
      maxMarks: Number(values.totalMarks),
    };

    try {
      setLoading(true);
      await axiosInstance.put(
        `/api/teacher/assignments/${id}`,
        payload
      );
      navigate("/assignments");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLES (SAME AS UPLOAD) ================= */
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
        Edit Assignment
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label style={labelStyle}>Assignment Name *</label>
            <Field name="assignmentName" style={inputStyle} />
            <ErrorMessage name="assignmentName" component="div" style={errorStyle} />
          </div>

          <div>
            <label style={labelStyle}>Assign Course *</label>
            <Field as="select" name="assignedCourses" style={inputStyle}>
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Field>
            <ErrorMessage name="assignedCourses" component="div" style={errorStyle} />
          </div>

          <div>
            <label style={labelStyle}>Duration *</label>
            <Field name="duration" style={inputStyle} />
            <ErrorMessage name="duration" component="div" style={errorStyle} />
          </div>

          <div>
            <label style={labelStyle}>Total Marks *</label>
            <Field type="number" name="totalMarks" style={inputStyle} />
            <ErrorMessage name="totalMarks" component="div" style={errorStyle} />
          </div>

          <div>
            <label style={labelStyle}>Due Date *</label>
            <Field type="date" name="dueDate" style={inputStyle} />
            <ErrorMessage name="dueDate" component="div" style={errorStyle} />
          </div>

          <div className="md:col-span-2 mt-3 d-flex gap-2">
            <button
              type="submit"
              disabled={loading}
              style={{
                
                padding: "12px",
                background: "#FEBA01",
                fontWeight: "700",
                borderRadius: "6px",
                fontSize: "16px",
                textAlign:'center'
              }}
            >
              {loading ? "Updating..." : "Update Assignment"}
            </button>
          </div>

        </Form>
      </Formik>
    </div>
  );
};

export default EditAssignment;
