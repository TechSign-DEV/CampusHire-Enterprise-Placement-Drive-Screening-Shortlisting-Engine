import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    studentId: "",
    companyName: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      };

      if (form.role === "STUDENT") {
        payload.studentId = form.studentId.trim();
      }

      if (form.role === "RECRUITER") {
        payload.companyName = form.companyName.trim();
      }

      await register(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-heading">
        <span className="eyebrow">GET STARTED</span>
        <h2>Create your account</h2>
        <p>Join the CampusHire placement portal.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            maxLength={100}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            className="form-control"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Register as</label>
          <select
            className="form-select"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
            <option value="RECRUITER">Recruiter</option>
          </select>
        </div>

        {form.role === "STUDENT" && (
          <div className="mb-3">
            <label className="form-label">Student ID</label>
            <input
              className="form-control"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="Enter your college ID"
              required
            />
          </div>
        )}

        {form.role === "RECRUITER" && (
          <div className="mb-3">
            <label className="form-label">Company name</label>
            <input
              className="form-control"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
            />
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <button
          className="btn btn-primary w-100 auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}