
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Save } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  department: "",
  graduationYear: "",
  tenthPercentage: "",
  twelfthPercentage: "",
  cgpa: "",
  activeBacklogs: "0",
  totalBacklogs: "0",
  skills: ""
};

export default function StudentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/students/me");
        const profile = response.data.profile;

        if (profile) {
          setForm({
            department: profile.department || "",
            graduationYear: String(profile.graduationYear ?? ""),
            tenthPercentage: String(profile.tenthPercentage ?? ""),
            twelfthPercentage: String(profile.twelfthPercentage ?? ""),
            cgpa: String(profile.cgpa ?? ""),
            activeBacklogs: String(profile.activeBacklogs ?? 0),
            totalBacklogs: String(profile.totalBacklogs ?? 0),
            skills: (profile.skills || []).join(", ")
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your academic profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const activeBacklogs = Number(form.activeBacklogs);
    const totalBacklogs = Number(form.totalBacklogs);

    if (activeBacklogs > totalBacklogs) {
      setError(
        "Active backlogs cannot exceed total backlogs."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        department: form.department.trim(),
        graduationYear: Number(form.graduationYear),
        tenthPercentage: Number(form.tenthPercentage),
        twelfthPercentage: Number(form.twelfthPercentage),
        cgpa: Number(form.cgpa),
        activeBacklogs,
        totalBacklogs,
        skills: form.skills
          .split(",")
          .map(skill => skill.trim())
          .filter(Boolean)
      };

      const response = await api.put("/students/me", payload);

      const profile = response.data.profile;

      setForm({
        department: profile.department,
        graduationYear: String(profile.graduationYear),
        tenthPercentage: String(profile.tenthPercentage),
        twelfthPercentage: String(profile.twelfthPercentage),
        cgpa: String(profile.cgpa),
        activeBacklogs: String(profile.activeBacklogs),
        totalBacklogs: String(profile.totalBacklogs),
        skills: (profile.skills || []).join(", ")
      });

      setSuccess("Academic profile saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save your academic profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading academic profile...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-icon">CH</div>
          <div>
            <strong>CampusHire</strong>
            <div className="text-secondary small">
              Student Academic Profile
            </div>
          </div>
        </div>

        <Link className="btn btn-outline-secondary" to="/dashboard">
          <ArrowLeft size={16} className="me-2" />
          Dashboard
        </Link>
      </header>

      <main className="profile-container">
        <div className="profile-heading">
          <div className="feature-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h1>Academic Profile</h1>
            <p>Enter accurate details for placement eligibility screening.</p>
          </div>
        </div>

        <div className="profile-account">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <span>Student ID: {user?.studentId || "Not provided"}</span>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <h5>Academic details</h5>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="MECH">Mechanical (MECH)</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Graduation year</label>
              <input
                className="form-control"
                type="number"
                name="graduationYear"
                min="2000"
                max="2100"
                value={form.graduationYear}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">10th percentage</label>
              <input
                className="form-control"
                type="number"
                name="tenthPercentage"
                min="0"
                max="100"
                step="0.01"
                value={form.tenthPercentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">12th / Diploma percentage</label>
              <input
                className="form-control"
                type="number"
                name="twelfthPercentage"
                min="0"
                max="100"
                step="0.01"
                value={form.twelfthPercentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">CGPA (out of 10)</label>
              <input
                className="form-control"
                type="number"
                name="cgpa"
                min="0"
                max="10"
                step="0.01"
                value={form.cgpa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Active backlogs</label>
              <input
                className="form-control"
                type="number"
                name="activeBacklogs"
                min="0"
                max="100"
                step="1"
                value={form.activeBacklogs}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Total backlogs to date</label>
              <input
                className="form-control"
                type="number"
                name="totalBacklogs"
                min="0"
                max="100"
                step="1"
                value={form.totalBacklogs}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Skills</label>
              <input
                className="form-control"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Java, React, MongoDB, SQL"
              />
              <div className="form-text">
                Separate skills using commas.
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-4">{error}</div>
          )}

          {success && (
            <div className="alert alert-success mt-4">{success}</div>
          )}

          <button
            className="btn btn-primary auth-submit mt-4"
            type="submit"
            disabled={saving}
          >
            <Save size={16} className="me-2" />
            {saving ? "Saving..." : "Save academic profile"}
          </button>
        </form>
      </main>
    </div>
  );
}
