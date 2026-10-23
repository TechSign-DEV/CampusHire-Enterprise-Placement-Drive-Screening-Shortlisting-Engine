
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileCheck,
  CalendarDays,
  ClipboardList,
  Video,
  ArrowUpRight,
  GraduationCap,
  Building,
  ChartNoAxesCombined,
  ShieldCheck,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const dashboardCards = {
  ADMIN: [
    {
      title: "Manage Students",
      description: "View student profiles and academic records.",
      path: "/admin/students",
      icon: Users,
      color: "blue",
      category: "MANAGEMENT",
    },
    {
      title: "Manage Companies",
      description: "Manage companies registered on CampusHire.",
      path: "/admin/companies",
      icon: Building2,
      color: "green",
      category: "MANAGEMENT",
    },
    {
      title: "User Management",
      description: "Control access and manage user accounts.",
      path: "/admin/users",
      icon: ShieldCheck,
      color: "red",
      category: "ADMINISTRATION",
    },
    {
      title: "Placement Drives",
      description: "Explore and oversee recruitment drives.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "purple",
      category: "RECRUITMENT",
    },
    {
      title: "Screening & Shortlisting",
      description: "Evaluate eligibility and select candidates.",
      path: "/screening",
      icon: FileCheck,
      color: "orange",
      category: "RECRUITMENT",
    },
    {
      title: "Interview Scheduling",
      description: "Organize rounds and manage interview slots.",
      path: "/interviews",
      icon: CalendarDays,
      color: "pink",
      category: "RECRUITMENT",
    },
    {
      title: "Analytics Dashboard",
      description: "Monitor placement performance and activity.",
      path: "/analytics",
      icon: ChartNoAxesCombined,
      color: "cyan",
      category: "INSIGHTS",
    },
    {
      title: "Placement Reports",
      description: "Export recruitment and interview reports.",
      path: "/reports",
      icon: FileSpreadsheet,
      color: "green",
      category: "INSIGHTS",
    },
  ],
  STUDENT: [
    {
      title: "My Academic Profile",
      description: "Manage your academic details and eligibility.",
      path: "/student/profile",
      icon: GraduationCap,
      color: "blue",
      category: "MY PLACEMENT",
    },
    {
      title: "Placement Drives",
      description: "Explore opportunities that match your profile.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "green",
      category: "MY PLACEMENT",
    },
    {
      title: "My Applications",
      description: "Track your applications and selection progress.",
      path: "/student/applications",
      icon: ClipboardList,
      color: "purple",
      category: "MY PLACEMENT",
    },
    {
      title: "My Interviews",
      description: "View interview schedules and meeting links.",
      path: "/student/interviews",
      icon: Video,
      color: "orange",
      category: "MY PLACEMENT",
    },
  ],
  RECRUITER: [
    {
      title: "Company Profile",
      description: "Maintain your company information.",
      path: "/company-profile",
      icon: Building,
      color: "blue",
      category: "RECRUITMENT",
    },
    {
      title: "Placement Drives",
      description: "Create and manage your hiring drives.",
      path: "/drives",
      icon: BriefcaseBusiness,
      color: "green",
      category: "RECRUITMENT",
    },
    {
      title: "Screening & Shortlisting",
      description: "Evaluate applicants and shortlist candidates.",
      path: "/screening",
      icon: FileCheck,
      color: "purple",
      category: "CANDIDATE MANAGEMENT",
    },
    {
      title: "Interview Scheduling",
      description: "Schedule interviews for shortlisted candidates.",
      path: "/interviews",
      icon: CalendarDays,
      color: "orange",
      category: "CANDIDATE MANAGEMENT",
    },
    {
      title: "Analytics Dashboard",
      description: "Review recruitment progress and statistics.",
      path: "/analytics",
      icon: ChartNoAxesCombined,
      color: "cyan",
      category: "INSIGHTS",
    },
    {
      title: "Placement Reports",
      description: "Export application and interview reports.",
      path: "/reports",
      icon: FileSpreadsheet,
      color: "green",
      category: "INSIGHTS",
    },
  ],
};

const roleLabels = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  RECRUITER: "Recruiter",
};

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const cards = dashboardCards[role] || [];
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <div className="cd-content cd-dashboard-only">
      <section className="cd-hero">
        <div className="cd-hero-copy">
          <span className="cd-hero-eyebrow">
            <Sparkles size={14} />
            YOUR CAMPUSHIRE WORKSPACE
          </span>

          <h1>
            Welcome back,
            <br />
            <span>{firstName}.</span>
          </h1>

          <p>
            Everything you need for your placement journey, all in one
            place. Choose a module below to get started.
          </p>

          <div className="cd-hero-meta">
            <span className="cd-role-pill">
              <ShieldCheck size={15} />
              {roleLabels[role] || role || "Member"}
            </span>
            <span className="cd-meta-separator" />
            <span>{cards.length} available modules</span>
          </div>
        </div>

        <div className="cd-hero-art" aria-hidden="true">
          <div className="cd-art-circle cd-art-circle-one" />
          <div className="cd-art-circle cd-art-circle-two" />
          <div className="cd-art-cap">
            <GraduationCap size={91} strokeWidth={1.3} />
          </div>

          <div className="cd-art-card cd-art-card-one">
            <span className="cd-art-card-icon">
              <BriefcaseBusiness size={19} />
            </span>
            <span>
              <strong>Career growth</strong>
              <small>Opportunities await</small>
            </span>
          </div>

          <div className="cd-art-card cd-art-card-two">
            <span className="cd-art-check">✓</span>
            <span>
              <strong>One workspace</strong>
              <small>Organized placement</small>
            </span>
          </div>
          <div className="cd-art-sparkle cd-art-sparkle-one">✦</div>
          <div className="cd-art-sparkle cd-art-sparkle-two">✧</div>
        </div>
      </section>

      <section className="cd-module-section">
        <div className="cd-section-header">
          <div>
            <span className="cd-section-eyebrow">GET THINGS DONE</span>
            <h2>Your workspace</h2>
            <p>Pick up where you left off or explore another module.</p>
          </div>

          <span className="cd-module-counter">
            <span>{cards.length.toString().padStart(2, "0")}</span>
            MODULES
          </span>
        </div>

        {cards.length === 0 ? (
          <div className="cd-empty-state">
            <ShieldCheck size={28} />
            <h3>Role not recognized</h3>
            <p>
              Your account role is not recognized. Please verify your
              account role.
            </p>
          </div>
        ) : (
          <div className="cd-module-grid">
            {cards.map((card, index) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.path}
                  to={card.path}
                  className={`cd-module-card cd-card-${card.color}`}
                  style={{ "--cd-card-index": index }}
                >
                  <div className="cd-module-card-top">
                    <span className="cd-module-icon">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <span className="cd-module-arrow">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>

                  <span className="cd-module-category">
                    {card.category}
                  </span>

                  <h3>{card.title}</h3>
                  <p>{card.description}</p>

                  <div className="cd-module-card-bottom">
                    <span>Open module</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="cd-footer">
        <span className="cd-footer-brand">
          <GraduationCap size={18} />
          CampusHire
        </span>
        <span>Placement Drive Management System</span>
        <span>Signed in as {user?.email || "User"}</span>
      </footer>
    </div>
  );
}
