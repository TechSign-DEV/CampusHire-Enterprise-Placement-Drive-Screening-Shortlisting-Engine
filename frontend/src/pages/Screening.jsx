
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, RefreshCw, Users } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Screening() {
  const { user } = useAuth();

  const [drives, setDrives] = useState([]);
  const [driveId, setDriveId] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/drives")
      .then(response => {
        setDrives(response.data.drives);

        if (response.data.drives.length > 0) {
          setDriveId(response.data.drives[0]._id);
        }
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          "Unable to load placement drives."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const loadResults = async (id = driveId) => {
    if (!id) return;

    const response = await api.get(
      `/applications/drives/${id}/results`
    );

    setResults(response.data.applications);

    const counts = {
      eligible: 0,
      notEligible: 0,
      pending: 0
    };

    response.data.applications.forEach(application => {
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
      totalStudents: response.data.count,
      ...counts
    });

    const initialScores = {};

    response.data.applications.forEach(application => {
      if (application.codingScore !== null &&
          application.codingScore !== undefined) {
        initialScores[application.student._id] =
          String(application.codingScore);
      }
    });

    setScores(initialScores);
  };

  const runScreening = async () => {
    setError("");
    setSuccess("");
    setWorking(true);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/screen`
      );

      setSummary(response.data.summary);
      await loadResults();
      setSuccess("Eligibility screening completed successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Screening failed."
      );
    } finally {
      setWorking(false);
    }
  };

  const saveScore = async studentId => {
    setError("");
    setSuccess("");

    const score = Number(scores[studentId]);

    if (
      scores[studentId] === "" ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      setError("Enter a coding score between 0 and 100.");
      return;
    }

    setWorking(true);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/assessments`,
        { studentId, score }
      );

      setSummary(response.data.summary);
      await loadResults();
      setSuccess("Assessment saved and eligibility recalculated.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save assessment."
      );
    } finally {
      setWorking(false);
    }
  };

  const shortlist = async () => {
    setError("");
    setSuccess("");
    setWorking(true);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/shortlist`
      );

      await loadResults();

      setSuccess(
        `${response.data.shortlistedCount} applicants shortlisted.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Shortlisting failed."
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

    loadResults(driveId).catch(() => {
      setResults([]);
      setSummary(null);
    });
  }, [driveId]);

  if (loading) {
    return <div className="p-4">Loading screening dashboard...</div>;
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
            Evaluate student records and manage shortlisting.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {drives.length === 0 ? (
        <div className="profile-form">
          No placement drives found. Create a drive first.
        </div>
      ) : (
        <>
          <div className="profile-form mb-4">
            <label className="form-label">Select placement drive</label>

            <select
              className="form-select"
              value={driveId}
              onChange={event => setDriveId(event.target.value)}
            >
              {drives.map(drive => (
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
                onClick={() => loadResults()}
                disabled={working}
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
                ["Pending", summary.pending]
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
                    <th>Coding score</th>
                    <th>Application status</th>
                    <th>Reasons</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map(application => {
                    const student = application.student;

                    return (
                      <tr key={application._id}>
                        <td>
                          <strong>{student?.name || "Student"}</strong>
                          <div className="text-secondary small">
                            {student?.email}
                          </div>
                          <div className="text-secondary small">
                            {student?.studentId}
                          </div>
                        </td>

                        <td>
                          <span className={
                            application.eligibilityStatus === "ELIGIBLE"
                              ? "badge text-bg-success"
                              : application.eligibilityStatus === "PENDING"
                                ? "badge text-bg-warning"
                                : "badge text-bg-danger"
                          }>
                            {application.eligibilityStatus}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              min="0"
                              max="100"
                              style={{ width: 85 }}
                              value={scores[student?._id] ?? ""}
                              onChange={event => setScores(previous => ({
                                ...previous,
                                [student._id]: event.target.value
                              }))}
                              disabled={!student}
                              placeholder="0–100"
                            />

                            <button
                              className="btn btn-sm btn-outline-primary"
                              disabled={working || !student}
                              onClick={() => saveScore(student._id)}
                            >
                              Save
                            </button>
                          </div>
                        </td>

                        <td>{application.applicationStatus}</td>

                        <td>
                          {application.reasons.length
                            ? application.reasons.join("; ")
                            : "All criteria satisfied"}
                        </td>
                      </tr>
                    );
                  })}

                  {results.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No screening records yet. Select a drive and run screening.
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
