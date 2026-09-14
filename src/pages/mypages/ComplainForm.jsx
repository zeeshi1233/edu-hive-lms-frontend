import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import LmsLoader from "../../components/common/LmsLoader";

export default function ComplainForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation (extra safety)
    if (!form.name || !form.category || !form.message) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      title: form.name,
      description: form.message,
      category: form.category,
    };

    try {
      setLoading(true);

      await axiosInstance.post("/api/student/complaints", payload);

      alert("✅ Your complaint has been submitted successfully!");

      // reset form
      setForm({
        name: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section p-24 radius-16 bg-base h-100">
      <div className="mb-24">
        <h3 className="text-xl fw-bold">
          Complain Form{" "}
          <span style={{ color: "#FEBA01" }}>(Student Support)</span>
        </h3>
        <p className="text-muted">
          Submit your academic or portal-related issues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Full Name */}
        <div className="col-md-6">
          <label className="form-label fw-semibold">Full Name</label>
          <input
            type="text"
            className="form-control rounded-3 py-2"
            placeholder="Enter your name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div className="col-md-6">
          <label className="form-label fw-semibold">Category</label>
          <select
            className="form-select rounded-3"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Issue Category</option>
            <option value="academic">Academic Issue</option>
            <option value="attendance">Attendance Issue</option>
            <option value="technical">Technical Issue</option>
            <option value="portal_login">Portal Login Issue</option>
            <option value="finance">Fee / Finance Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div className="col-12">
          <label className="form-label fw-semibold">Message</label>
          <textarea
            rows={5}
            className="form-control rounded-3"
            placeholder="Describe your issue in detail..."
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            disabled={loading}
          ></textarea>
        </div>

        {/* Button */}
        <div className="col-12 d-flex justify-content-end">
          <button
            type="submit"
            className="btn p-10 fw-semibold rounded-3 shadow-sm"
            style={{
              letterSpacing: "0.4px",
              background: "#FEBA01",
              minWidth: "180px",
            }}
            disabled={loading}
          >
            {loading ? <LmsLoader variant="button" label="Submitting..." /> : "Submit Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}
