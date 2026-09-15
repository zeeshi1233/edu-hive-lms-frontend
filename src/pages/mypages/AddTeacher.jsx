import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { boardOptions } from "../../constants/boardOptions";
import FormPageHeader from "../../components/common/FormPageHeader";
import SearchableSelect from "../../components/common/SearchableSelect";
import { extractList, toCourseSelectOptions } from "../../utils/lmsData";
import LmsLoader from "../../components/common/LmsLoader";

const AddTeacher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [preview, setPreview] = useState(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [courses, setCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const editTeacher = location.state;
  const isEdit = !!editTeacher;

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

  useEffect(() => {
    if (isEdit && editTeacher?.profileImage) {
      setPreview(editTeacher.profileImage);
    }
  }, [isEdit, editTeacher]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: isEdit
      ? Yup.string().min(6, "Password must be at least 6 characters")
      : Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d+$/, "Only numbers are allowed")
      .max(11, "Phone number can't exceed 11 digits"),
    qualification: Yup.string().required("Qualification is required"),
    joiningDate: Yup.date().required("Joining date is required"),
    profileImage: isEdit ? Yup.mixed() : Yup.mixed().required("Profile image required"),
    assignedCourses: Yup.array()
      .min(1, "Select at least one course")
      .required("Courses are required"),
    boards: Yup.array().min(1, "Select at least one board").required("Boards are required"),
  });

  const inputBg = isDark ? "#1E293B" : "#fff";
  const inputBorder = isDark ? "#334155" : "#E2E8F0";
  const inputColor = isDark ? "#E2E8F0" : "#111";
  const formBg = isDark ? "#0F172A" : "#FFFFFF";
  const textColor = isDark ? "#E2E8F0" : "#111";
  const labelColor = isDark ? "#CBD5E1" : "#111";

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
    display: "block",
    marginBottom: "6px",
    color: labelColor,
  };
  const errorStyle = { color: "#F87171", fontSize: "12px", marginBottom: "10px" };
  const rowStyle = { display: "flex", flexWrap: "wrap", gap: "20px" };
  const colStyle = { flex: "1 1 45%", minWidth: "250px" };

  const onSubmit = async (values) => {
    const formData = new FormData();
    // specialization removed from UI — backend fills default from qualification
    const skipKeys = [
      "specialization",
      "availability",
      "levelType",
      "oLevelHourPay",
      "aLevelHourPay",
    ];

    Object.keys(values).forEach((key) => {
      if (skipKeys.includes(key)) return;

      if (key === "profileImage") {
        if (values.profileImage instanceof File) {
          formData.append("profileImage", values.profileImage);
        }
        return;
      }

      if (key === "password" && !values.password) return;

      if (key === "gender" && values.gender) {
        formData.append("gender", String(values.gender).toLowerCase());
        return;
      }

      if (Array.isArray(values[key])) {
        values[key].forEach((item) => {
          formData.append(key, item);
        });
        return;
      }

      if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
        formData.append(key, values[key]);
      }
    });

    formData.append("role", "teacher");
    setLoading(true);

    try {
      if (isEdit) {
        await axiosInstance.put(`/api/admin/teachers/${editTeacher._id}`, formData);
        alert("Teacher updated successfully");
      } else {
        await axiosInstance.post("/api/auth/register", formData);
      }
      navigate("/all-teacher");
    } catch (err) {
      console.error(err);
      const validationMsg = err.response?.data?.errors?.[0]?.msg;
      alert(
        err.response?.data?.message ||
          validationMsg ||
          err.response?.data?.error ||
          "Failed to save teacher. Please check the form and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = toCourseSelectOptions(courses);

  return (
    <div className="lms-page">
      <FormPageHeader
        title={isEdit ? "Edit Teacher" : "Add New Teacher"}
        subtitle="Assign instructors to courses with a searchable course dropdown"
        backTo="/all-teacher"
      />

      <div
        style={{
          background: formBg,
          margin: "8px auto",
          padding: "28px",
          border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
          borderRadius: "16px",
          color: textColor,
        }}
      >
        <Formik
          enableReinitialize
          initialValues={{
            name: editTeacher?.name || "",
            email: editTeacher?.email || "",
            password: "",
            phone: editTeacher?.phone || "",
            gender: editTeacher?.gender || "",
            address: editTeacher?.address || "",
            qualification: editTeacher?.qualification || "",
            experienceYears: editTeacher?.experienceYears || "",
            joiningDate: editTeacher?.joiningDate
              ? String(editTeacher.joiningDate).split("T")[0]
              : "",
            profileImage: editTeacher?.profileImage || null,
            boards: editTeacher?.boards || [],
            assignedCourses:
              editTeacher?.assignedCourses?.map((c) => (typeof c === "string" ? c : c._id)) || [],
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle}>Full Name *</label>
                <Field name="name" style={inputStyle} />
                <ErrorMessage name="name" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Email *</label>
                <Field name="email" type="email" style={inputStyle} />
                <ErrorMessage name="email" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>{isEdit ? "Password (optional)" : "Password *"}</label>
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
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Field>
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Address</label>
                <Field name="address" style={inputStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Qualification *</label>
                <Field name="qualification" style={inputStyle} />
                <ErrorMessage name="qualification" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Experience (Years)</label>
                <Field name="experienceYears" type="number" style={inputStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Assign Courses *</label>
                <SearchableSelect
                  isMulti
                  isDark={isDark}
                  options={courseOptions}
                  value={courseOptions.filter((option) =>
                    values.assignedCourses.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    setFieldValue(
                      "assignedCourses",
                      selectedOptions ? selectedOptions.map((option) => option.value) : []
                    );
                  }}
                  placeholder="Search and select courses"
                />
                <ErrorMessage name="assignedCourses" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Boards *</label>
                <SearchableSelect
                  isMulti
                  isDark={isDark}
                  options={boardOptions}
                  value={boardOptions.filter((board) => values.boards.includes(board.value))}
                  onChange={(selectedOptions) => {
                    setFieldValue(
                      "boards",
                      selectedOptions ? selectedOptions.map((option) => option.value) : []
                    );
                  }}
                  placeholder="Search and select boards"
                />
                <ErrorMessage name="boards" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>Joining Date *</label>
                <Field name="joiningDate" type="date" style={inputStyle} />
                <ErrorMessage name="joiningDate" component="div" style={errorStyle} />
              </div>

              <div style={colStyle}>
                <label style={labelStyle}>{isEdit ? "Profile Image" : "Profile Image *"}</label>
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

              <div style={{ flex: "1 1 100%" }} className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="lms-btn-ghost"
                  onClick={() => navigate("/all-teacher")}
                >
                  Close
                </button>
                <button type="submit" className="lms-btn-primary" disabled={loading || fetchingCourses}>
                  {loading ? (
                    <LmsLoader variant="button" label="Saving..." />
                  ) : fetchingCourses ? (
                    <LmsLoader variant="button" label="Loading..." />
                  ) : isEdit ? (
                    "Update Teacher"
                  ) : (
                    "Add Teacher"
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

export default AddTeacher;
