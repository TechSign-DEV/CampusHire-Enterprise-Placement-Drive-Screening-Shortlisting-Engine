
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Building2,
  ClipboardCheck,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Users,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Sparkles,
} from "lucide-react";
import "./Home.css";

const features = [
  {
    icon: <ClipboardCheck />,
    title: "Smart Eligibility Screening",
    description:
      "Evaluate academic criteria and identify eligible candidates for placement drives.",
  },
  {
    icon: <BriefcaseBusiness />,
    title: "Placement Drives",
    description:
      "Discover opportunities and manage recruitment drives in one place.",
  },
  {
    icon: <ChartNoAxesCombined />,
    title: "Application Tracking",
    description:
      "Track application progress, shortlisting decisions, and candidate status.",
  },
  {
    icon: <CalendarDays />,
    title: "Interview Scheduling",
    description:
      "Organize interview rounds, schedule slots, and access meeting details.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Register as a student, recruiter, or administrator.",
  },
  {
    number: "02",
    title: "Complete Your Profile",
    description: "Add your academic details and relevant information.",
  },
  {
    number: "03",
    title: "Explore Opportunities",
    description: "Find drives and check your eligibility.",
  },
  {
    number: "04",
    title: "Start Your Journey",
    description: "Apply for eligible drives and attend interviews.",
  },
];

export default function Home() {
  return (
    <div className="ch-home">
      <header className="ch-navbar">
        <Link to="/" className="ch-brand">
          <span className="ch-brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            Campus<span>Hire</span>
          </span>
        </Link>

        <nav className="ch-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="ch-nav-actions">
          <Link to="/login" className="ch-login-btn">
            Login
          </Link>
          <Link to="/register" className="ch-primary-btn ch-nav-cta">
            Get Started <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <main>
        <section className="ch-hero" id="home">
          <div className="ch-hero-content">
            <div className="ch-eyebrow">
              <Sparkles size={15} />
              SMART CAMPUS PLACEMENT PLATFORM
            </div>

            <h1>
              Your Career
              <br />
              Starts <span>Here.</span>
            </h1>

            <p className="ch-hero-description">
              Bringing students, recruiters, and opportunities together.
              Make campus placements simpler, smarter, and more organized
              with CampusHire.
            </p>

            <div className="ch-hero-actions">
              <Link to="/register" className="ch-primary-btn">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#features" className="ch-secondary-btn">
                Explore Features
              </a>
            </div>

            <div className="ch-trust-note">
              <CheckCircle2 size={18} />
              One platform for your placement journey
            </div>
          </div>

          <div className="ch-hero-visual">
            <div className="ch-visual-glow" />

            <div className="ch-dashboard-card">
              <div className="ch-dash-header">
                <div>
                  <span className="ch-small-label">CAMPUSHIRE OVERVIEW</span>
                  <h3>Placement Workspace</h3>
                </div>
                <span className="ch-live-dot">Live workspace</span>
              </div>

              <div className="ch-mini-stats">
                <div className="ch-mini-stat">
                  <span className="ch-stat-icon blue">
                    <Users size={19} />
                  </span>
                  <small>Students</small>
                  <strong>Profiles</strong>
                  <span>Manage candidates</span>
                </div>

                <div className="ch-mini-stat">
                  <span className="ch-stat-icon purple">
                    <Building2 size={19} />
                  </span>
                  <small>Recruiters</small>
                  <strong>Companies</strong>
                  <span>Manage employers</span>
                </div>
              </div>

              <div className="ch-progress-panel">
                <div className="ch-progress-heading">
                  <div>
                    <strong>Recruitment workflow</strong>
                    <p>From screening to interviews</p>
                  </div>
                  <ChartNoAxesCombined size={21} />
                </div>

                <div className="ch-workflow-row">
                  <span className="ch-workflow-icon">
                    <ClipboardCheck size={18} />
                  </span>
                  <div>
                    <strong>Eligibility screening</strong>
                    <small>Review candidate criteria</small>
                  </div>
                  <CheckCircle2 className="ch-complete-icon" size={19} />
                </div>

                <div className="ch-workflow-row">
                  <span className="ch-workflow-icon purple-bg">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <strong>Interview scheduling</strong>
                    <small>Manage interview rounds</small>
                  </div>
                  <ArrowRight className="ch-row-arrow" size={19} />
                </div>
              </div>
            </div>

            <div className="ch-floating-card ch-float-top">
              <span className="ch-floating-icon">
                <GraduationCap size={21} />
              </span>
              <div>
                <strong>Student first</strong>
                <small>Career opportunities</small>
              </div>
            </div>

            <div className="ch-floating-card ch-float-bottom">
              <span className="ch-floating-icon green-bg">
                <CalendarDays size={20} />
              </span>
              <div>
                <strong>Stay organized</strong>
                <small>Interview schedules</small>
              </div>
            </div>
          </div>
        </section>

        <section className="ch-audience-strip" id="about">
          <div>
            <span className="ch-audience-icon">
              <GraduationCap />
            </span>
            <div>
              <strong>For Students</strong>
              <p>Discover and apply for opportunities.</p>
            </div>
          </div>

          <div>
            <span className="ch-audience-icon purple-bg">
              <Building2 />
            </span>
            <div>
              <strong>For Recruiters</strong>
              <p>Screen, shortlist, and schedule candidates.</p>
            </div>
          </div>

          <div>
            <span className="ch-audience-icon green-bg">
              <ChartNoAxesCombined />
            </span>
            <div>
              <strong>For Administrators</strong>
              <p>Oversee placement activity and reports.</p>
            </div>
          </div>
        </section>

        <section className="ch-features-section" id="features">
          <div className="ch-section-heading">
            <span className="ch-section-kicker">POWERFUL FEATURES</span>
            <h2>Everything you need for successful placements</h2>
            <p>
              A connected workspace to manage every step of the campus
              recruitment process.
            </p>
          </div>

          <div className="ch-feature-grid">
            {features.map((feature, index) => (
              <article className="ch-feature-card" key={feature.title}>
                <div className={`ch-feature-icon ch-feature-${index + 1}`}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#how-it-works" className="ch-feature-link">
                  Learn more <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="ch-process-section" id="how-it-works">
          <div className="ch-section-heading">
            <span className="ch-section-kicker">SIMPLE PROCESS</span>
            <h2>Your placement journey, step by step</h2>
            <p>Move from registration to interview with a clear workflow.</p>
          </div>

          <div className="ch-steps-grid">
            {steps.map((step) => (
              <article className="ch-step-card" key={step.number}>
                <span className="ch-step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>

          <div className="ch-bottom-cta">
            <div>
              <span className="ch-section-kicker">READY TO BEGIN?</span>
              <h2>Take the next step with CampusHire.</h2>
              <p>
                Create your account and get started with your placement
                journey.
              </p>
            </div>
            <Link to="/register" className="ch-primary-btn">
              Create Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="ch-footer">
        <Link to="/" className="ch-brand ch-footer-brand">
          <span className="ch-brand-icon">
            <GraduationCap size={23} />
          </span>
          <span>
            Campus<span>Hire</span>
          </span>
        </Link>

        <p>
          Connecting talent with opportunity. Making campus placements
          simpler.
        </p>

        <div className="ch-footer-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <div className="ch-footer-bottom">
          © {new Date().getFullYear()} CampusHire. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
