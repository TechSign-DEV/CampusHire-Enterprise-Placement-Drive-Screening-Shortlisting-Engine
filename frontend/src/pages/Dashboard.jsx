
import { Link, useNavigate } from "react-router-dom";

import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileCheck,
  CalendarDays,
  ClipboardList,
  Video,
  ArrowRight,
  GraduationCap,
  Building,
  ChartNoAxesCombined,
  ShieldCheck,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const dashboardCards = {
  ADMIN: [
    {
      title: "Manage Students",
      description: "View registered students and their academic profiles.",
      path: "/admin/students",
      icon: Users,
      color: "primary",
    },
    {
      title: "Manage Companies",
      description: "View companies registered by recruiters.",
      path: "/admin/companies",
      icon: Building2,
      color: "success",
    },
    {
      title: "User Management",
      description: "Search users and activate or deactivate accounts.",
      path: "/admin/users",
      icon: ShieldCheck,
      color: "danger",
    },
    {
      title: "Placement Drives",
      description: "View placement drives and their details.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "info",
    },
    {
      title: "Screening & Shortlisting",
      description: "Evaluate eligibility and shortlist candidates.",
      path: "/screening",
      icon: FileCheck,
      color: "warning",
    },
    {
      title: "Interview Scheduling",
      description: "Create interview batches and manage candidate slots.",
      path: "/interviews",
      icon: CalendarDays,
      color: "danger",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Track students, companies, applications, and interview statistics.",
      path: "/analytics",
      icon: ChartNoAxesCombined,
      color: "primary",
    },
    {
      title: "Placement Reports",
      description: "Export application, screening, and interview reports.",
      path: "/reports",
      icon: FileSpreadsheet,
      color: "success",
    },
  ],

  STUDENT: [
    {
      title: "My Academic Profile",
      description: "Maintain your academic details and eligibility data.",
      path: "/student/profile",
      icon: GraduationCap,
      color: "primary",
    },
    {
      title: "Placement Drives",
      description: "Explore open placement drives and job opportunities.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "success",
    },
    {
      title: "My Applications",
      description: "Apply to eligible drives and track your application status.",
      path: "/student/applications",
      icon: ClipboardList,
      color: "info",
    },
    {
      title: "My Interviews",
      description: "View interview dates, times, and meeting links.",
      path: "/student/interviews",
      icon: Video,
      color: "warning",
    },
  ],

  RECRUITER: [
    {
      title: "Company Profile",
      description: "Manage your company information.",
      path: "/company-profile",
      icon: Building,
      color: "primary",
    },
    {
      title: "Placement Drives",
      description: "Create and manage your placement drives.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "success",
    },
    {
      title: "Screening & Shortlisting",
      description: "Review eligible applicants and shortlist candidates.",
      path: "/screening",
      icon: FileCheck,
      color: "info",
    },
    {
      title: "Interview Scheduling",
      description: "Schedule interviews for shortlisted candidates.",
      path: "/interviews",
      icon: CalendarDays,
      color: "warning",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Track your placement drives, applications, and interview progress.",
      path: "/analytics",
      icon: ChartNoAxesCombined,
      color: "primary",
    },
    {
      title: "Placement Reports",
      description: "Export application, screening, and interview reports.",
      path: "/reports",
      icon: FileSpreadsheet,
      color: "success",
    },
  ],
};

const roleLabels = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  RECRUITER: "Recruiter",
};

const colorClasses = {
  primary: "dashboard-icon-primary",
  success: "dashboard-icon-success",
  danger: "dashboard-icon-danger",
  info: "dashboard-icon-info",
  warning: "dashboard-icon-warning",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role?.toUpperCase();
  const cards = dashboardCards[role] || [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4 dashboard-page">
      {/* Welcome section */}
      <div className="card dashboard-welcome mb-4">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div className="dashboard-welcome-icon">
                <GraduationCap size={32} />
              </div>

              <div>
                <p className="dashboard-eyebrow mb-1">
                  CAMPUSHIRE WORKSPACE
                </p>

                <h2 className="fw-bold mb-2 dashboard-welcome-title">
                  Welcome, {user?.name || "User"}!
                </h2>

                <span className="badge rounded-pill text-bg-primary px-3 py-2">
                  {roleLabels[role] || role || "User"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-danger dashboard-logout"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>

          <p className="dashboard-welcome-description mb-0 mt-4">
            Manage your placement activities, applications, screening,
            interviews, and recruitment progress from one place.
          </p>
        </div>
      </div>

      {/* Workspace heading */}
      <div className="dashboard-section-heading mb-4">
        <div>
          <h4 className="fw-bold mb-1">Your Workspace</h4>
          <p className="text-secondary mb-0">
            Choose a section to continue.
          </p>
        </div>

        <span className="dashboard-module-count">
          {cards.length} {cards.length === 1 ? "Module" : "Modules"}
        </span>
      </div>

      {/* Role-specific cards */}
      {cards.length === 0 ? (
        <div className="alert alert-warning">
          Your account role is not recognized. Please verify your account role.
        </div>
      ) : (
        <div className="row g-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const iconClass =
              colorClasses[card.color] || colorClasses.primary;

            return (
              <div
                className="col-12 col-sm-6 col-xl-4"
                key={card.path}
              >
                <Link
                  to={card.path}
                  className="dashboard-card-link"
                  aria-label={`Open ${card.title}`}
                >
                  <div className="card dashboard-module-card h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className={`dashboard-module-icon ${iconClass}`}>
                          <Icon size={25} strokeWidth={1.9} />
                        </div>

                        <span className="dashboard-arrow">
                          <ArrowRight size={19} />
                        </span>
                      </div>

                      <h5 className="fw-bold mb-2 dashboard-module-title">
                        {card.title}
                      </h5>

                      <p className="text-secondary mb-0 dashboard-module-description">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="dashboard-footer mt-5 pt-4">
        <span className="text-secondary small">
          CampusHire · Placement Drive Management System
        </span>

        <span className="text-secondary small dashboard-footer-email">
          Signed in as {user?.email || "User"}
        </span>
      </div>
    </div>
  );
}
