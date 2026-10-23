
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = () => ({
  title: "",
  description: "",
  jobType: "FULL_TIME",
  packageLpa: "6",
  applicationDeadline: "",
  eligibleDepartments: "",
  graduationYear: String(new Date().getFullYear() + 1),
  tenthPercentage: "60",
  twelfthPercentage: "60",
  cgpa: "6",
  maxActiveBacklogs: "0",
  minCodingScore: "60",
  status: "DRAFT",
});

export default function Drives() {
  const { user } = useAuth();

  const [drives, setDrives] = useState([]);
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDrives = useCallback(async () => {
    const response = await api.get("/drives");
    setDrives(response.data.drives || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === "RECRUITER") {
          const response = await api.get("/companies/me");
          setCompany(response.data.company);
        }

        await loadDrives();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load placement drives."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role, loadDrives]);

  const change = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const startEdit = (drive) => {
    setEditingId(drive._id);

    setForm({
      title: drive.title,
      description: drive.description || "",
      jobType: drive.jobType,
      packageLpa: String(drive.packageLpa),
      applicationDeadline: new Date(drive.applicationDeadline)
        .toISOString()
        .slice(0, 16),
      eligibleDepartments: (drive.eligibleDepartments || []).join(", "),
      graduationYear: String(drive.criteria.graduationYear),
      tenthPercentage: String(drive.criteria.tenthPercentage),
      twelfthPercentage: String(drive.criteria.twelfthPercentage),
      cgpa: String(drive.criteria.cgpa),
      maxActiveBacklogs: String(drive.criteria.maxActiveBacklogs),
      minCodingScore: String(drive.criteria.minCodingScore),
      status: drive.status,
    });

    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        jobType: form.jobType,
        packageLpa: Number(form.packageLpa),
        applicationDeadline: new Date(
          form.applicationDeadline
        ).toISOString(),
        eligibleDepartments: form.eligibleDepartments
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        criteria: {
          graduationYear: Number(form.graduationYear),
          tenthPercentage: Number(form.tenthPercentage),
          twelfthPercentage: Number(form.twelfthPercentage),
          cgpa: Number(form.cgpa),
          maxActiveBacklogs: Number(form.maxActiveBacklogs),
          minCodingScore: Number(form.minCodingScore),
        },
        status: form.status,
      };

      if (editingId) {
        await api.put(`/drives/${editingId}`, payload);
        setSuccess("Placement drive updated.");
      } else {
        await api.post("/drives", payload);
        setSuccess("Placement drive created.");
      }

      resetForm();
      await loadDrives();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save placement drive."
      );
    } finally {
      setSaving(false);
    }
  };

  const closeDrive = async (id) => {
    setError("");
    setSuccess("");

    try {
      await api.put(`/drives/${id}`, { status: "CLOSED" });
      setSuccess("Placement drive closed.");
      await loadDrives();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to close placement drive."
      );
    }
  };

  // Submit an application for the selected drive.
  const applyToDrive = async (driveId) => {
    setError("");
    setSuccess("");
    setApplyingId(driveId);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/apply`
      );

      setSuccess(
        response.data?.message ||
          "Application submitted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to apply for this placement drive."
      );
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="p-4">Loading placement drives...</div>;
  }

  return (
    <main className="dashboard-content">
     

      <h1 className="h3 fw-bold">Placement Drives</h1>

      <p className="text-secondary">
        {user?.role === "STUDENT"
          ? "Explore open recruitment opportunities."
          : user?.role === "ADMIN"
            ? "Review and manage company placement drives."
            : "Create and manage your company's recruitment drives."}
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* Recruiter company profile warning */}
      {user?.role === "RECRUITER" && !company && (
        <div className="alert alert-warning">
          Create your company profile before creating a drive.{" "}
          <Link to="/company-profile">Create company profile</Link>
        </div>
      )}

      {/* Recruiter create/edit form */}
      {user?.role === "RECRUITER" && company && (
        <form className="profile-form mb-4" onSubmit={submit}>
          <h2 className="h5 mb-3">
            {editingId ? "Edit Placement Drive" : "Create Placement Drive"}
          </h2>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="drive-title">
                Job title
              </label>
              <input
                id="drive-title"
                className="form-control"
                name="title"
                value={form.title}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="drive-job-type">
                Job type
              </label>
              <select
                id="drive-job-type"
                className="form-select"
                name="jobType"
                value={form.jobType}
                onChange={change}
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="drive-package">
                Package (LPA)
              </label>
              <input
                id="drive-package"
                className="form-control"
                type="number"
                name="packageLpa"
                min="0"
                step="0.1"
                value={form.packageLpa}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="drive-deadline">
                Application deadline
              </label>
              <input
                id="drive-deadline"
                className="form-control"
                type="datetime-local"
                name="applicationDeadline"
                min={new Date().toISOString().slice(0, 16)}
                value={form.applicationDeadline}
                onChange={change}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="drive-description">
                Job description
              </label>
              <textarea
                id="drive-description"
                className="form-control"
                name="description"
                rows="2"
                value={form.description}
                onChange={change}
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="drive-departments">
                Eligible departments (comma-separated; blank means all)
              </label>
              <input
                id="drive-departments"
                className="form-control"
                name="eligibleDepartments"
                value={form.eligibleDepartments}
                onChange={change}
                placeholder="CSE, IT, ECE"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="drive-graduation">
                Graduation year
              </label>
              <input
                id="drive-graduation"
                className="form-control"
                type="number"
                name="graduationYear"
                min="2000"
                max="2100"
                value={form.graduationYear}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="drive-tenth">
                Minimum 10th %
              </label>
              <input
                id="drive-tenth"
                className="form-control"
                type="number"
                name="tenthPercentage"
                min="0"
                max="100"
                step="0.1"
                value={form.tenthPercentage}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="drive-twelfth">
                Minimum 12th %
              </label>
              <input
                id="drive-twelfth"
                className="form-control"
                type="number"
                name="twelfthPercentage"
                min="0"
                max="100"
                step="0.1"
                value={form.twelfthPercentage}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="drive-cgpa">
                Minimum CGPA
              </label>
              <input
                id="drive-cgpa"
                className="form-control"
                type="number"
                name="cgpa"
                min="0"
                max="10"
                step="0.1"
                value={form.cgpa}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="drive-backlogs">
                Maximum active backlogs
              </label>
              <input
                id="drive-backlogs"
                className="form-control"
                type="number"
                name="maxActiveBacklogs"
                min="0"
                step="1"
                value={form.maxActiveBacklogs}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
            
           
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="drive-status">
                Drive status
              </label>
              <select
                id="drive-status"
                className="form-select"
                name="status"
                value={form.status}
                onChange={change}
              >
                <option value="DRAFT">Draft</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Drive"
                  : "Create Drive"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Placement drive cards */}
      <div className="row g-3">
        {drives.map((drive) => {
          const deadlinePassed =
            new Date(drive.applicationDeadline).getTime() <= Date.now();

          const canApply =
            user?.role === "STUDENT" &&
            drive.status === "OPEN" &&
            !deadlinePassed;

          return (
            <div className="col-12 col-lg-6" key={drive._id}>
              <article className="feature-card h-100">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <h5>{drive.title}</h5>
                    <p className="mb-1">
                      {drive.company?.name || "Company"}
                    </p>
                  </div>

                  <span
                    className={`badge align-self-start ${
                      drive.status === "OPEN"
                        ? "text-bg-success"
                        : drive.status === "CLOSED"
                          ? "text-bg-danger"
                          : "text-bg-secondary"
                    }`}
                  >
                    {drive.status}
                  </span>
                </div>

                <p className="mt-2">
                  {drive.description || "No description provided."}
                </p>

                <div className="small text-secondary">
                  <p className="mb-1">
                    Job type: {drive.jobType?.replace("_", " ")}
                  </p>
                  <p className="mb-1">
                    Package: {drive.packageLpa} LPA
                  </p>
                  <p className="mb-1">
                    CGPA cutoff: {drive.criteria?.cgpa ?? "Not specified"}
                  </p>
                  <p className="mb-1">
                    Coding score: {drive.criteria?.minCodingScore ?? "Not specified"}/100
                  </p>
                  <p className="mb-1">
                    Graduation year: {drive.criteria?.graduationYear ?? "Not specified"}
                  </p>
                  <p className="mb-1">
                    Deadline:{" "}
                    {new Date(drive.applicationDeadline).toLocaleString()}
                  </p>
                </div>

                {/* Student application action */}
                {user?.role === "STUDENT" && (
                  <div className="mt-3">
                    {canApply ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={applyingId === drive._id}
                        onClick={() => applyToDrive(drive._id)}
                      >
                        {applyingId === drive._id
                          ? "Applying..."
                          : "Apply Now"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled
                      >
                        {drive.status !== "OPEN"
                          ? "Drive Not Open"
                          : "Application Deadline Passed"}
                      </button>
                    )}
                  </div>
                )}

                {/* Recruiter action */}
                {user?.role === "RECRUITER" && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-3"
                    onClick={() => startEdit(drive)}
                  >
                    Edit Drive
                  </button>
                )}

                {/* Admin action */}
                {user?.role === "ADMIN" && drive.status !== "CLOSED" && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-3 ms-2"
                    onClick={() => closeDrive(drive._id)}
                  >
                    Close Drive
                  </button>
                )}
              </article>
            </div>
          );
        })}

        {drives.length === 0 && (
          <div className="col-12">
            <div className="profile-form text-secondary">
              No placement drives available.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
