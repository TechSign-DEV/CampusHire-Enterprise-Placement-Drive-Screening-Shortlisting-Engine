
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function StudentApplications() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    const [driveResponse, applicationResponse] = await Promise.all([
      api.get("/drives"),
      api.get("/applications/me")
    ]);

    setDrives(driveResponse.data.drives);
    setApplications(applicationResponse.data.applications);
  }, []);

  useEffect(() => {
    loadData()
      .catch(err => {
        setError(
          err.response?.data?.message ||
          "Unable to load placement information."
        );
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const apply = async driveId => {
    setError("");
    setSuccess("");
    setWorkingId(driveId);

    try {
      const response = await api.post(
        `/applications/drives/${driveId}/apply`
      );

      setSuccess(response.data.message);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.reasons?.join("; ") ||
        err.response?.data?.message ||
        "Application submission failed."
      );
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return <div className="p-4">Loading applications...</div>;
  }

  const applicationMap = new Map(
    applications.map(application => [
      application.drive?._id,
      application
    ])
  );

  return (
    <main className="dashboard-content">
      <Link to="/dashboard" className="btn btn-link mb-3">
        ← Back to Dashboard
      </Link>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold">Placement Opportunities</h1>
          <p className="text-secondary mb-0">
            Check eligibility, apply for drives and track your status.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setError("");
            loadData().catch(() => {
              setError("Unable to refresh placement information.");
            });
          }}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-3">
        {drives.map(drive => {
          const application = applicationMap.get(drive._id);

          return (
            <div className="col-12 col-lg-6" key={drive._id}>
              <article className="feature-card">
                <div className="feature-icon">
                  <BriefcaseBusiness size={23} />
                </div>

                <h5>{drive.title}</h5>
                <p className="mb-1">
                  {drive.company?.name || "Company"}
                </p>

                <div className="small text-secondary">
                  <p className="mb-1">
                    Package: {drive.packageLpa} LPA
                  </p>
                  <p className="mb-1">
                    CGPA cutoff: {drive.criteria.cgpa}
                  </p>
                  <p className="mb-1">
                    Coding score: {drive.criteria.minCodingScore}/100
                  </p>
                  <p className="mb-1">
                    Deadline: {new Date(
                      drive.applicationDeadline
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="mt-3">
                  {application ? (
                    <>
                      <div className="mb-2">
                        Eligibility:{" "}
                        <strong>{application.eligibilityStatus}</strong>
                      </div>

                      <div className="mb-3">
                        Application:{" "}
                        <strong>{application.applicationStatus}</strong>
                      </div>

                      {application.reasons?.length > 0 && (
                        <p className="small text-secondary">
                          {application.reasons.join("; ")}
                        </p>
                      )}

                      {application.eligibilityStatus === "ELIGIBLE" &&
                        application.applicationStatus === "NOT_APPLIED" && (
                          <button
                            className="btn btn-primary"
                            disabled={workingId === drive._id}
                            onClick={() => apply(drive._id)}
                          >
                            {workingId === drive._id
                              ? "Applying..."
                              : "Apply Now"}
                          </button>
                        )}
                    </>
                  ) : (
                    <span className="text-secondary small">
                      Eligibility has not been calculated yet. Ask the
                      placement team to run screening.
                    </span>
                  )}
                </div>
              </article>
            </div>
          );
        })}

        {drives.length === 0 && (
          <div className="col-12">
            <div className="profile-form text-secondary">
              No open placement drives are available right now.
            </div>
          </div>
        )}
      </div>

      <h2 className="h4 fw-bold mt-5 mb-3">My Applications</h2>

      <div className="profile-form">
        {applications.length === 0 ? (
          <p className="text-secondary mb-0">
            You have no application records yet. Your eligibility results
            will appear after the placement team runs screening.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Eligibility</th>
                  <th>Application status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application._id}>
                    <td>
                      {application.drive?.company?.name || "Company"}
                    </td>
                    <td>{application.drive?.title || "Drive"}</td>
                    <td>{application.eligibilityStatus}</td>
                    <td>{application.applicationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
