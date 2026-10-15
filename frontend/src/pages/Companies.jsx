
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/companies")
      .then(response => setCompanies(response.data.companies))
      .catch(err => {
        setError(
          err.response?.data?.message ||
          "Unable to load companies."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-content">
      <Link to="/dashboard" className="btn btn-link mb-3">
        ← Back to Dashboard
      </Link>

      <h1 className="h3 fw-bold">Company Management</h1>
      <p className="text-secondary">
        Review recruiter company profiles and their contact details.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="row g-3 mt-1">
          {companies.map(company => (
            <div className="col-12 col-lg-6" key={company._id}>
              <article className="feature-card">
                <h5>{company.name}</h5>
                <p>{company.industry || "Industry not specified"}</p>

                <div className="small text-secondary">
                  <p className="mb-1">
                    Recruiter: {company.recruiter?.name || "Unknown"}
                  </p>
                  <p className="mb-1">
                    Email: {company.recruiter?.email || "—"}
                  </p>
                  <p className="mb-1">
                    Location: {company.location || "Not specified"}
                  </p>

                  {company.website && (
                    <p className="mb-1">
                      Website:{" "}
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {company.website}
                      </a>
                    </p>
                  )}
                </div>

                {company.description && (
                  <p className="mt-3">{company.description}</p>
                )}
              </article>
            </div>
          ))}

          {companies.length === 0 && (
            <div className="col-12">
              <div className="profile-form text-secondary">
                No company profiles have been created yet.
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
