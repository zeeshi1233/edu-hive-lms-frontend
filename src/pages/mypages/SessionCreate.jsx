import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import FormPageHeader from "../../components/common/FormPageHeader";
import SearchableSelect from "../../components/common/SearchableSelect";
import {
  extractList,
  getTeacherName,
  toCourseSelectOptions,
} from "../../utils/lmsData";
import LmsLoader from "../../components/common/LmsLoader";
import notify from "../../utils/notify";

const SessionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

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

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
    marginBottom: "4px",
    fontSize: "14px",
    background: isDark ? "#0F172A" : "#fff",
    color: isDark ? "#E2E8F0" : "#111",
  };
  const colStyle = { flex: "1 1 45%", minWidth: "250px" };
  const labelStyle = {
    fontWeight: "600",
    marginBottom: "6px",
    display: "block",
    fontSize: "14px",
    color: isDark ? "#E2E8F0" : "#111",
  };
  const errorStyle = { color: "#EF4444", fontSize: "12px", marginBottom: "10px" };
  const rowStyle = { display: "flex", flexWrap: "wrap", gap: "16px" };

  const initialValues = {
    title: "",
    courseId: "",
    teacherId: "",
    topic: "",
    startTime: "",
    type: "Regular Class",
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Session title is required"),
    courseId: Yup.string().required("Course is required"),
    teacherId: Yup.string().required("Teacher is required"),
    topic: Yup.string().required("Topic is required"),
    startTime: Yup.date().required("Start time is required"),
    type: Yup.string().required("Class type is required"),
  });

  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const [courseRes, teacherRes] = await Promise.all([
          axiosInstance.get("/api/admin/courses"),
          axiosInstance.get("/api/admin/teachers"),
        ]);
        setCourses(extractList(courseRes, ["courses", "data"]));
        setTeachers(extractList(teacherRes, ["teachers", "data"]));
      } catch (error) {
        console.error("Failed to fetch session form data", error);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const courseOptions = toCourseSelectOptions(courses);
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher._id || teacher.id,
    label: getTeacherName(teacher),
  }));

  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const payload = {
        title: values.title,
        courseId: values.courseId,
        teacherId: values.teacherId,
        topic: values.topic,
        startTime: values.startTime,
        type: values.type,
      };
      await axiosInstance.post("/api/admin/sessions", payload);
      notify.success("Session created successfully");
      navigate("/all-session");
      resetForm();
    } catch (error) {
      console.error(error);
      notify.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-page">
      <FormPageHeader
        title="Create Session"
        subtitle="Sessions should preferably be scheduled from the Class Calendar"
        backTo="/class-calendar"
      />

      <div
        style={{
          background: isDark ? "#1E293B" : "#FFFFFF",
          padding: "28px",
          margin: "8px auto",
          borderRadius: "16px",
          boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.28)" : "0 8px 24px rgba(15,23,42,0.05)",
          color: isDark ? "#E2E8F0" : "#111",
          position: "relative",
        }}
      >
        {fetching && <LmsLoader variant="overlay" label="Loading form data..." />}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle}>Session Title *</label>
                <Field name="title" style={inputStyle} />
                <ErrorMessage name="title" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Topic *</label>
                <Field name="topic" style={inputStyle} />
                <ErrorMessage name="topic" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Course *</label>
                <SearchableSelect
                  isDark={isDark}
                  options={courseOptions}
                  value={courseOptions.find((option) => option.value === values.courseId) || null}
                  onChange={(option) => setFieldValue("courseId", option?.value || "")}
                  placeholder="Search courses"
                />
                <ErrorMessage name="courseId" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Instructor *</label>
                <SearchableSelect
                  isDark={isDark}
                  options={teacherOptions}
                  value={teacherOptions.find((option) => option.value === values.teacherId) || null}
                  onChange={(option) => setFieldValue("teacherId", option?.value || "")}
                  placeholder="Search instructors"
                />
                <ErrorMessage name="teacherId" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Class Type *</label>
                <Field as="select" name="type" style={inputStyle}>
                  <option value="Regular Class">Regular Class</option>
                  <option value="Extra Class">Extra Class</option>
                </Field>
                <ErrorMessage name="type" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Start Time *</label>
                <Field name="startTime" type="datetime-local" style={inputStyle} />
                <ErrorMessage name="startTime" component="div" style={errorStyle} />
              </div>

              <div style={{ flex: "1 1 100%" }} className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="lms-btn-ghost"
                  onClick={() => navigate("/class-calendar")}
                >
                  Close
                </button>
                <button type="submit" className="lms-btn-primary" disabled={loading || fetching}>
                  {loading ? <LmsLoader variant="button" label="Creating..." /> : "Create Session"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SessionCreate;
