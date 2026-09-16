import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import notify from "../../utils/notify";

const EditCourse = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const getTeachers = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/teachers");
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error("Failed to fetch teachers");
      }
    };

    getTeachers();
  }, []);

  // ⛔ Agar direct URL open kare to safety
  if (!state?.course) {
    navigate("/all-courses");
    return null;
  }
  console.log(state?.course)

  const course = state.course;
  const initialValues = {
    title: course.title || "",
    description: course.description || "",
    duration: course.duration || "",
    instructor: course.instructor?._id || "",
    price: course.price || "",
  };


  const validationSchema = Yup.object({
    title: Yup.string().required("Course title is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.number().required("Duration is required"),
    price: Yup.number().required("Price is required"),
    instructor: Yup.string().required("Instructor is required"),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/api/admin/courses/${id}`, {
        title: values.title,
        description: values.description,
        duration: Number(values.duration),
        instructor: values.instructor,
        price: Number(values.price),
      });

      navigate("/all-courses");
      notify.success("Course updated successfully");
    } catch (error) {
      notify.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "4px",
    fontSize: "14px",
  };
  const colStyle = { flex: "1 1 45%", minWidth: "250px" };
  const labelStyle = { fontWeight: "600", marginBottom: "3px", display: "block", fontSize: "14px" };
  const errorStyle = { color: "red", fontSize: "12px", marginBottom: "10px" };
  const formContainer = {
    background: "#0001",
    padding: "20px",
    margin: "20px auto",
    borderRadius: "12px",
    boxShadow: "0 2px 6px #0001",
  };


  return (
    <div
      style={formContainer}
    >
      <h2 style={{ fontSize: "20px", marginBottom: "18px" }}>
        Update Course
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize   
      >
        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

          <div>
            <label style={labelStyle}>Course Title *</label>
            <Field  name="title" className="form-control"  style={inputStyle}/>
            <ErrorMessage style={errorStyle} name="title" component="div" className="text-danger" />
          </div>
          <div>
            <label style={labelStyle}>Assign Instructor *</label>

            <Field style={colStyle} as="select" name="instructor" className="form-control">
              <option value="">Select Instructor</option>

              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </Field>

            <ErrorMessage
              name="instructor"
              component="div"
              className="text-danger"
              style={errorStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Price</label>
            <Field name="price" type="number" style={inputStyle} className="form-control" />
            <ErrorMessage name="price" style={errorStyle} component="div" className="text-danger" />
          </div>
          <div>
            <label style={labelStyle}>Duration (Months) *</label>
            <Field name="duration" type="number" style={inputStyle} className="form-control" />
            <ErrorMessage name="duration" style={errorStyle} component="div" className="text-danger" />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Description *</label>
            <Field as="textarea" rows="4" style={inputStyle} name="description" className="form-control" />
            <ErrorMessage name="description" style={errorStyle} component="div" className="text-danger" />
          </div>

          <div className="md:col-span-2 mt-3">
            <button
              type="submit"
              className="btn w-100"
              style={{
                background: "#FEBA01",
                fontWeight: "700",
                padding: "12px",
              }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Course"}
            </button>
          </div>

        </Form>
      </Formik>
    </div>
  );
};

export default EditCourse;
