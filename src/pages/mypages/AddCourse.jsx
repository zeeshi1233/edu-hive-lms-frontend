import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";
import { BOARD_LIST } from "../../constants/boardOptions";
import FormPageHeader from "../../components/common/FormPageHeader";
import {
  generateCourseCode,
  getCourseBoard,
  getCourseCode,
  getCourseTitle,
} from "../../utils/lmsData";

const AddCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editCourse = location.state?.course;
  const isEdit = !!editCourse;
  const [loading, setLoading] = useState(false);
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

  const existingBoard = getCourseBoard(editCourse);
  const initialValues = {
    title: getCourseTitle(editCourse) || "",
    description: editCourse?.description || "",
    board: existingBoard && BOARD_LIST.includes(existingBoard) ? existingBoard : existingBoard ? "Other" : "",
    otherBoard: existingBoard && !BOARD_LIST.includes(existingBoard) ? existingBoard : "",
    serialNumber: editCourse?.serialNumber || getCourseCode(editCourse) || "",
    code: getCourseCode(editCourse) || "",
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Course title is required"),
    description: Yup.string().required("Description is required"),
    board: Yup.string().required("Education board is required"),
    otherBoard: Yup.string().when("board", {
      is: "Other",
      then: (schema) => schema.required("Other board name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

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
  const labelStyle = {
    fontWeight: "600",
    marginBottom: "6px",
    display: "block",
    fontSize: "14px",
  };
  const errorStyle = { color: "#EF4444", fontSize: "12px", marginBottom: "10px" };
  const formContainer = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    padding: "28px",
    margin: "8px auto",
    borderRadius: "16px",
    boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.28)" : "0 8px 24px rgba(15,23,42,0.05)",
    color: isDark ? "#E2E8F0" : "#111",
  };

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      const board = values.board === "Other" ? values.otherBoard : values.board;
      const code = values.code || generateCourseCode(values.title, board);
      const payload = {
        title: values.title,
        description: values.description,
        board,
        code,
        serialNumber: values.serialNumber || code,
        courseCode: code,
      };

      if (isEdit) {
        await axiosInstance.put(`/api/admin/courses/${editCourse._id}`, payload);
      } else {
        await axiosInstance.post("/api/admin/courses", payload);
      }

      navigate("/all-courses");
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-page">
      <FormPageHeader
        title={isEdit ? "Edit Course" : "Add Course"}
        subtitle="Create a unique course code for each subject and education board"
        backTo="/all-courses"
      />

      <div style={formContainer}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => {
            const board = values.board === "Other" ? values.otherBoard : values.board;
            const liveCode = generateCourseCode(values.title, board);
            const displayName =
              values.title && board ? `${values.title} for ${board}` : values.title;

            return (
              <Form className="row g-3">
                <div className="col-md-6">
                  <label style={labelStyle}>Course Title *</label>
                  <Field
                    name="title"
                    placeholder="e.g. Physics"
                    style={inputStyle}
                    onChange={(e) => {
                      setFieldValue("title", e.target.value);
                      setFieldValue("code", generateCourseCode(e.target.value, board));
                    }}
                  />
                  <ErrorMessage name="title" component="div" style={errorStyle} />
                </div>

                <div className="col-md-6">
                  <label style={labelStyle}>Education Board *</label>
                  <Field
                    as="select"
                    name="board"
                    style={inputStyle}
                    onChange={(e) => {
                      setFieldValue("board", e.target.value);
                      const nextBoard =
                        e.target.value === "Other" ? values.otherBoard : e.target.value;
                      setFieldValue("code", generateCourseCode(values.title, nextBoard));
                    }}
                  >
                    <option value="">Select Board</option>
                    {BOARD_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage name="board" component="div" style={errorStyle} />
                </div>

                {values.board === "Other" && (
                  <div className="col-md-6">
                    <label style={labelStyle}>Other Board Name *</label>
                    <Field
                      name="otherBoard"
                      placeholder="Enter Board Name"
                      style={inputStyle}
                      onChange={(e) => {
                        setFieldValue("otherBoard", e.target.value);
                        setFieldValue("code", generateCourseCode(values.title, e.target.value));
                      }}
                    />
                    <ErrorMessage name="otherBoard" component="div" style={errorStyle} />
                  </div>
                )}

                <div className="col-12">
                  <label style={labelStyle}>Unique Course Code</label>
                  <input
                    value={values.code || liveCode}
                    readOnly
                    style={{ ...inputStyle, background: isDark ? "#111827" : "#F8FAFC" }}
                  />
                  <small style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                    Auto-generated from subject and board
                  </small>
                </div>

                {displayName ? (
                  <div className="col-12">
                    <div className="lms-info-tile">
                      <small>Course listing name</small>
                      <strong>{displayName}</strong>
                    </div>
                  </div>
                ) : null}

                <div className="col-12">
                  <label style={labelStyle}>Course Description *</label>
                  <Field as="textarea" name="description" rows="4" style={inputStyle} />
                  <ErrorMessage name="description" component="div" style={errorStyle} />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    className="lms-btn-ghost"
                    onClick={() => navigate("/all-courses")}
                  >
                    Close
                  </button>
                  <button type="submit" className="lms-btn-primary" disabled={loading}>
                    {loading
                      ? isEdit
                        ? "Updating..."
                        : "Saving..."
                      : isEdit
                      ? "Update Course"
                      : "Save Course"}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddCourse;
