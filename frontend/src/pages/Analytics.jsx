
import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileCheck,
  UserCheck,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const numberFormat = new Intl.NumberFormat("en-IN");

const cards = [
  {
    key: "totalStudents",
    title: "Total Students",
    icon: Users,
    color: "primary",
  },
  {
    key: "totalCompanies",
    title: "Companies",
    icon: Building2,
    color: "success",
  },
  {
    key: "totalDrives",
    title: "Placement Drives",
    icon: BriefcaseBusiness,
    color: "info",
  },
  {
    key: "openDrives",
    title: "Open Drives",
    icon: CalendarDays,
    color: "warning",
  },
  {
    key: "totalApplications",
    title: "Applications",
    icon: FileCheck,
    color: "primary",
  },
  {
    key: "eligibleApplications",
    title: "Eligible Candidates",
    icon: UserCheck,
    color: "success",
  },
  {
    key: "shortlistedApplications",
    title: "Shortlisted",
    icon: CheckCircle2,
    color: "info",
  },
  {
    key: "totalInterviews",
    title: "Scheduled Interviews",
    icon: CalendarDays,
    color: "warning",
  },
];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/analytics");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        Loading analytics dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={loadAnalytics}>
          <RefreshCw size={16} className="me-2" />
          Try Again
        </button>
      </div>
    );
  }

  const overview = data?.overview || {};
  const applicationStats = data?.applicationStats || {};

  const statusRows = [
    ["Not Applied", applicationStats.NOT_APPLIED],
    ["Applied", applicationStats.APPLIED],
    ["Shortlisted", applicationStats.SHORTLISTED],
    ["Interview Scheduled", applicationStats.INTERVIEW_SCHEDULED],
    ["Rejected", applicationStats.REJECTED],
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Analytics Dashboard</h2>
          <p className="text-secondary mb-0">
            Monitor placement activity and recruitment progress.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadAnalytics}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="col-12 col-sm-6 col-xl-3"
              key={card.key}
            >
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-secondary">
                      {card.title}
                    </span>

                    <div
                      className={`rounded-3 p-2 bg-${card.color}-subtle text-${card.color}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <h2 className="fw-bold mb-0">
                    {numberFormat.format(overview[card.key] || 0)}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Application Status</h5>
            </div>

            <div className="card-body">
              {statusRows.map(([label, value]) => {
                const count = value || 0;
                const total = overview.totalApplications || 0;
                const percentage =
                  total > 0 ? Math.min((count / total) * 100, 100) : 0;

                return (
                  <div className="mb-4" key={label}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>{label}</span>
                      <strong>{numberFormat.format(count)}</strong>
                    </div>

                    <div
                      className="progress"
                      role="progressbar"
                      aria-label={label}
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ height: 9 }}
                    >
                      <div
                        className="progress-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Recruitment Summary</h5>
            </div>

            <div className="card-body">
              <div className="d-flex justify-content-between py-3 border-bottom">
                <span className="text-secondary">Eligible candidates</span>
                <strong>
                  {numberFormat.format(
                    overview.eligibleApplications || 0
                  )}
                </strong>
              </div>

              <div className="d-flex justify-content-between py-3 border-bottom">
                <span className="text-secondary">Shortlisted candidates</span>
                <strong>
                  {numberFormat.format(
                    overview.shortlistedApplications || 0
                  )}
                </strong>
              </div>

              <div className="d-flex justify-content-between py-3 border-bottom">
                <span className="text-secondary">Interviews scheduled</span>
                <strong>
                  {numberFormat.format(
                    overview.totalInterviews || 0
                  )}
                </strong>
              </div>

              <div className="d-flex justify-content-between py-3">
                <span className="text-secondary">Interviews completed</span>
                <strong>
                  {numberFormat.format(
                    overview.completedInterviews || 0
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
