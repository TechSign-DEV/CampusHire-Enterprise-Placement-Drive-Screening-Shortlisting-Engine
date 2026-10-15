import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-icon">CH</div>
        <h1>CampusHire</h1>
        <p>Enterprise Placement Screening Engine</p>
      </div>

      <div className="auth-card">{children}</div>

      <p className="auth-footer">
        CampusHire · Placement Management Portal
      </p>
    </div>
  );
}