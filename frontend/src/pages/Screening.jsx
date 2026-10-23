
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, RefreshCw, Users } from "lucide-react";
import api from "../services/api";

export default function Screening() {
  const [drives, setDrives] = useState([]);
  const [driveId, setDriveId] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadDrives = async () => {
      try {
        const response = await api.get("/drives");
        const availableDrives = response.data.drives || [];

        setDrives(availableDrives);

        if (availableDrives.length > 0) {
          setDriveId(availableDrives[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load placement drives."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDrives();
  }, []);

  const loadResults = async (id = driveId) => {
    if (!id) return;

    const response = await api.get(
      `/applications/drives/${id}/results`
    );

    const applications = response.data.applications || [];

    setResults(applications);

    const counts = {
      eligible: 0,
      notEligible: 0,
      pending: 0,
    };

    applications.forEach((application) => {
      if (application.eligibilityStatus === "ELIGIBLE") {
        counts.eligible++;
      } else if (
        application.eligibilityStatus === "NOT_ELIGIBLE"
      ) {
        counts.notEligible++;
      } else {
        counts.pending++;
      }
    });

    setSummary({
      totalStudents: response.data.count ?? applications.length,
      ...counts,
    });
  };

  const runScreening = async () => {
    if (!driveId) return;

    setError("");
    setSuccess("");
    setWorking(true);

    try {
      await api.post(`/applications/drives/${driveId}/screen`);

      await loadResults(driveId);
      setSuccess("Eligibility screening completed successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Screening failed."
      );
    } finally {
      setWorking(false);
    }
  };

  const shortlist = async () => {
    if (!driveId) return;

    setError("");
    setSuccess("");
    setWorking(true);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/shortlist`
      );

      await loadResults(driveId);

      setSuccess(
        `${response.data.shortlistedCount} applicants shortlisted.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Shortlisting failed."
      );
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!driveId) {
      setResults([]);
      setSummary(null);
      return;
    }

    setResults([]);
    setSummary(null);
    setError("");

    loadResults(driveId).catch((err) => {
      setResults([]);
      setSummary(null);
      setError(
        err.response?.data?.message ||
          "Unable to load screening results."
      );
    });
  }, [driveId]);

  if (loading) {
    return (
      <div className="p-4">
        Loading screening dashboard...
      </div>
    );
  }

  return (
    <main className="dashboard-content">
      <Link to="/dashboard" className="btn btn-link mb-3">
        ← Back to Dashboard
      </Link>

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="feature-icon mb-0">
          <ClipboardCheck size={25} />
        </div>

        <div>
          <h1 className="h3 fw-bold mb-1">
            Eligibility Screening
          </h1>
          <p className="text-secondary mb-0">
            Evaluate academic eligibility and manage shortlisting.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      {drives.length === 0 ? (
        <div className="profile-form">
          No placement drives found. Create a drive first.
        </div>
      ) : (
        <>
          <div className="profile-form mb-4">
            <label className="form-label">
              Select placement drive
            </label>

            <select
              className="form-select"
              value={driveId}
              onChange={(event) => setDriveId(event.target.value)}
            >
              {drives.map((drive) => (
                <option key={drive._id} value={drive._id}>
                  {drive.company?.name || "Company"} — {drive.title}
                </option>
              ))}
            </select>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                className="btn btn-primary"
                onClick={runScreening}
                disabled={working || !driveId}
              >
                <RefreshCw size={16} className="me-2" />
                {working ? "Processing..." : "Run Screening"}
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setWorking(true);

                  loadResults()
                    .catch((err) => {
                      setError(
                        err.response?.data?.message ||
                          "Unable to refresh results."
                      );
                    })
                    .finally(() => setWorking(false));
                }}
                disabled={working || !driveId}
              >
                Refresh Results
              </button>

              <button
                className="btn btn-success"
                onClick={shortlist}
                disabled={working || !driveId}
              >
                Shortlist Eligible Applicants
              </button>
            </div>
          </div>

          {summary && (
            <div className="row g-3 mb-4">
              {[
                ["Students screened", summary.totalStudents],
                ["Eligible", summary.eligible],
                ["Not eligible", summary.notEligible],
                ["Pending", summary.pending],
              ].map(([label, value]) => (
                <div className="col-6 col-xl-3" key={label}>
                  <div className="feature-card">
                    <p>{label}</p>
                    <h2>{value}</h2>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="profile-form">
            <h2 className="h5 mb-3">
              <Users size={19} className="me-2" />
              Screening Results
            </h2>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Eligibility</th>
                    <th>Application status</th>
                    <th>Reasons</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((application) => {
                    const student = application.student;

                    return (
                      <tr key={application._id}>
                        <td>
                          <strong>
                            {student?.name || "Student"}
                          </strong>

                          <div className="text-secondary small">
                            {student?.email}
                          </div>

                          <div className="text-secondary small">
                            {student?.studentId}
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              application.eligibilityStatus === "ELIGIBLE"
                                ? "badge text-bg-success"
                                : application.eligibilityStatus === "PENDING"
                                  ? "badge text-bg-warning"
                                  : "badge text-bg-danger"
                            }
                          >
                            {application.eligibilityStatus}
                          </span>
                        </td>

                        <td>{application.applicationStatus}</td>

                        <td>
                          {application.reasons?.length
                            ? application.reasons.join("; ")
                            : "All criteria satisfied"}
                        </td>
                      </tr>
                    );
                  })}

                  {results.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4"
                      >
                        No screening records yet. Select a drive
                        and run screening.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
