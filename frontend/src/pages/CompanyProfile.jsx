
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  name: "",
  industry: "",
  website: "",
  location: "",
  description: ""
};

export default function CompanyProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/companies/me")
      .then(({ data }) => {
        if (data.company) {
          setForm({
            name: data.company.name || "",
            industry: data.company.industry || "",
            website: data.company.website || "",
            location: data.company.location || "",
            description: data.company.description || ""
          });
        }
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          "Unable to load company profile."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = event => {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.put("/companies/me", form);
      setSuccess("Company profile saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading company...</div>;

  return (
    <main className="profile-container">
   

      <form className="profile-form" onSubmit={handleSubmit}>
        <h1 className="h3 mb-2">Company Profile</h1>
        <p className="text-secondary mb-4">
          Manage your organization details.
        </p>

        <div className="mb-3">
          <label className="form-label">Company name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={150}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Industry</label>
          <input
            className="form-control"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="Information Technology"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Website</label>
          <input
            className="form-control"
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            className="form-control"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Hyderabad, Telangana"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="4"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell students about your organization"
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Company Profile"}
        </button>

        <Link to="/drives" className="btn btn-outline-primary ms-2">
          Manage Drives
        </Link>
      </form>
    </main>
  );
}
