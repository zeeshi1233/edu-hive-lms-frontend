import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import FormPageHeader from "../../components/common/FormPageHeader";
import SearchableSelect from "../../components/common/SearchableSelect";
import { extractList, toCourseSelectOptions } from "../../utils/lmsData";
import LmsLoader from "../../components/common/LmsLoader";

const AddStudent = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

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

  const initialValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    enrolledCourses: [],
    profileImage: null,
    admissionDate: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Student name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d+$/, "Only numbers allowed")
      .max(11, "Max 11 digits"),
    guardianName: Yup.string().required("Guardian name is required"),
    guardianPhone: Yup.string()
      .required("Guardian phone is required")
      .matches(/^\d+$/, "Numbers only")
      .max(11, "Max 11 digits"),
    enrolledCourses: Yup.array().min(1, "Select at least one course").required("Course is required"),
    admissionDate: Yup.date().required("Admission date is required"),
    profileImage: Yup.mixed().required("Profile image required"),
  });

  const formBg = isDark ? "#0F172A" : "#fff";
  const inputBg = isDark ? "#1E293B" : "#fff";
  const inputBorder = isDark ? "#334155" : "#E2E8F0";
  const inputColor = isDark ? "#E2E8F0" : "#111";
  const labelColor = isDark ? "#CBD5E1" : "#111";
  const textColor = isDark ? "#E2E8F0" : "#111";

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    marginBottom: "5px",
    borderRadius: "10px",
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: inputColor,
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "6px",
    display: "block",
    color: labelColor,
  };
  const errorStyle = { color: "#F87171", fontSize: "12px", marginBottom: "10px" };
  const rowStyle = { display: "flex", flexWrap: "wrap", gap: "20px" };
  const colStyle = { flex: "1 1 45%", minWidth: "250px" };

  const getCourses = async () => {
    try {
      setFetchingCourses(true);
      const res = await axiosInstance.get("/api/admin/courses");
      setCourses(extractList(res, ["courses", "data"]));
    } catch (error) {
      console.error("Failed to load courses", error);
    } finally {
      setFetchingCourses(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  const courseOptions = toCourseSelectOptions(courses);

  const onSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    const skipKeys = ["enrolledCourses", "feePlan", "totalFees", "feePaid", "batchTiming"];

    Object.keys(values).forEach((key) => {
      if (skipKeys.includes(key)) return;
      if (key === "profileImage") {
        if (values.profileImage instanceof File) {
          formData.append("profileImage", values.profileImage);
        }
        return;
      }
      if (key === "gender" && values.gender) {
        formData.append("gender", String(values.gender).toLowerCase());
        return;
      }
      if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
        formData.append(key, values[key]);
      }
    });

    // Backend Student model still requires these legacy fee fields
    formData.append("feePlan", "monthly");
    formData.append("totalFees", "0");
    if (!values.address) formData.append("address", "N/A");
    if (!values.dateOfBirth) formData.append("dateOfBirth", "2000-01-01");

    formData.append("role", "student");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/api/auth/register", formData);
      const studentData = res.data?.student || res.data?.user || res.data;
      const studentId = studentData?.id || studentData?._id;

      if (studentId && values.enrolledCourses?.length) {
        await Promise.all(
          values.enrolledCourses.map((courseId) =>
            axiosInstance.post("/api/admin/enrollments", {
              studentId,
              courseId,
              status: "active",
            })
          )
        );
      }

      navigate("/all-students");
      resetForm();
      setPreview(null);
    } catch (error) {
      console.error(error);
      const validationMsg = error.response?.data?.errors?.[0]?.msg;
      alert(
        error.response?.data?.message ||
          validationMsg ||
          error.response?.data?.error ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-page">
      <FormPageHeader
        title="Add New Student"
        subtitle="Assign courses with the same searchable multi-select used for teachers"
        backTo="/all-students"
      />

      <div
        style={{
          background: formBg,
          padding: "28px",
          margin: "8px auto",
          borderRadius: "16px",
          boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.28)" : "0 8px 24px rgba(15,23,42,0.05)",
          color: textColor,
        }}
      >
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle}>Name *</label>
                <Field name="name" style={inputStyle} />
                <ErrorMessage name="name" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Email *</label>
                <Field name="email" type="email" style={inputStyle} />
                <ErrorMessage name="email" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: "relative" }}>
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "40%",
                      transform: "translateY(-60%)",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
                  </span>
                </div>
                <ErrorMessage name="password" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Phone *</label>
                <Field name="phone" maxLength="11" style={inputStyle} />
                <ErrorMessage name="phone" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Gender</label>
                <Field as="select" name="gender" style={inputStyle}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Field>
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Date of Birth</label>
                <Field name="dateOfBirth" type="date" style={inputStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Address</label>
                <Field name="address" style={inputStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Guardian Name *</label>
                <Field name="guardianName" style={inputStyle} />
                <ErrorMessage name="guardianName" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Guardian Phone *</label>
                <Field name="guardianPhone" maxLength="11" style={inputStyle} />
                <ErrorMessage name="guardianPhone" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Enrolled Courses *</label>
                <SearchableSelect
                  isMulti
                  isDark={isDark}
                  options={courseOptions}
                  value={courseOptions.filter((option) =>
                    values.enrolledCourses.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    setFieldValue(
                      "enrolledCourses",
                      selectedOptions ? selectedOptions.map((option) => option.value) : []
                    );
                  }}
                  placeholder="Search and select courses"
                />
                <ErrorMessage name="enrolledCourses" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Profile Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  style={{ ...inputStyle, padding: "6px" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFieldValue("profileImage", file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <ErrorMessage name="profileImage" component="div" style={errorStyle} />
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: "100px", marginTop: "10px", borderRadius: "10px" }}
                  />
                )}
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Admission Date *</label>
                <Field name="admissionDate" type="date" style={inputStyle} />
                <ErrorMessage name="admissionDate" component="div" style={errorStyle} />
              </div>

              <div style={{ flex: "1 1 100%" }} className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="lms-btn-ghost"
                  onClick={() => navigate("/all-students")}
                >
                  Close
                </button>
                <button type="submit" className="lms-btn-primary" disabled={loading || fetchingCourses}>
                  {loading ? (
                    <LmsLoader variant="button" label="Adding..." />
                  ) : fetchingCourses ? (
                    <LmsLoader variant="button" label="Loading..." />
                  ) : (
                    "Add Student"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddStudent;
