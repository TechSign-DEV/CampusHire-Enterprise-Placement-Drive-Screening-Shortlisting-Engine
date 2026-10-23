
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  FileCheck,
  CalendarDays,
  ClipboardList,
  Video,
  ChartNoAxesCombined,
  ShieldCheck,
  FileSpreadsheet,
  Building,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

const navigation = {
  ADMIN: [
    { label: "Manage Students", path: "/admin/students", icon: Users },
    { label: "Manage Companies", path: "/admin/companies", icon: Building2 },
    { label: "User Management", path: "/admin/users", icon: ShieldCheck },
    { label: "Placement Drives", path: "/drives", icon: BriefcaseBusiness },
    { label: "Screening & Shortlisting", path: "/screening", icon: FileCheck },
    { label: "Interview Scheduling", path: "/interviews", icon: CalendarDays },
    { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
    { label: "Placement Reports", path: "/reports", icon: FileSpreadsheet },
  ],
  STUDENT: [
    { label: "My Academic Profile", path: "/student/profile", icon: GraduationCap },
    { label: "Placement Drives", path: "/drives", icon: BriefcaseBusiness },
    { label: "My Applications", path: "/student/applications", icon: ClipboardList },
    { label: "My Interviews", path: "/student/interviews", icon: Video },
  ],
  RECRUITER: [
    { label: "Company Profile", path: "/company-profile", icon: Building },
    { label: "Placement Drives", path: "/drives", icon: BriefcaseBusiness },
    { label: "Screening & Shortlisting", path: "/screening", icon: FileCheck },
    { label: "Interview Scheduling", path: "/interviews", icon: CalendarDays },
    { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
    { label: "Placement Reports", path: "/reports", icon: FileSpreadsheet },
  ],
};

const roleLabels = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  RECRUITER: "Recruiter",
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role?.toUpperCase();
  const links = navigation[role] || [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === "/drives") {
      return location.pathname === "/drives";
    }
    return location.pathname === path;
  };

  return (
    <div className="ml-layout">
      {mobileOpen && (
        <button
          type="button"
          className="ml-overlay"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`ml-sidebar ${mobileOpen ? "ml-sidebar-open" : ""}`}>
        <Link
          to="/dashboard"
          className="ml-brand"
          onClick={() => setMobileOpen(false)}
        >
          <span className="ml-brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>Campus<span className="ml-brand-blue">Hire</span></span>
          <button
            type="button"
            className="ml-mobile-close"
            aria-label="Close sidebar"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
            }}
          >
            <X size={20} />
          </button>
        </Link>

        <p className="ml-section-label">WORKSPACE</p>

        <nav className="ml-navigation">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`ml-nav-link ${
              location.pathname === "/dashboard" ? "ml-active" : ""
            }`}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <p className="ml-section-label ml-modules-label">YOUR MODULES</p>

          {links.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`ml-nav-link ${
                isActive(path) ? "ml-active" : ""
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={15} className="ml-chevron" />
            </Link>
          ))}
        </nav>

        <div className="ml-user-panel">
          <div className="ml-avatar">
            {(user?.name || "U").trim().charAt(0).toUpperCase()}
          </div>

          <div className="ml-user-details">
            <strong>{user?.name || "User"}</strong>
            <span>{roleLabels[role] || role || "Member"}</span>
          </div>

          <button
            type="button"
            className="ml-logout"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="ml-main">
        <header className="ml-topbar">
          <button
            type="button"
            className="ml-menu-button"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="ml-breadcrumb">
            <span>CampusHire</span>
            <ChevronRight size={15} />
            <strong>
              {location.pathname === "/dashboard"
                ? "Dashboard"
                : links.find((item) => item.path === location.pathname)?.label ||
                  "Workspace"}
            </strong>
          </div>

          <div className="ml-account">
            <span className="ml-online-dot" />
            <span className="ml-online-label">Workspace active</span>
          </div>
        </header>

        <div className="ml-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
