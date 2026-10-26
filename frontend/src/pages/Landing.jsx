import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

// Edit these to match your school
const SCHOOL_NAME = "School Management Platform";
const CONTACT = {
  email: "info@yboityacademy.co.za",
  phone: "+27713460191",
  address: "Johannesburg, Gauteng",
};

const FEATURES = [
  { title: "Attendance", text: "Teachers mark attendance in seconds and students can see their own record." },
  { title: "Exams & Performance", text: "Capture exam results and track progress for every student and class." },
  { title: "Assignments", text: "Set work, track due dates and see what has been submitted or graded." },
  { title: "Announcements", text: "Send news to everyone, or only to students or teachers." },
  { title: "Events Calendar", text: "One shared calendar for school events, tests and activities." },
  { title: "Library", text: "Keep the school library organised and available to students online." },
];

const BENEFITS = [
  { title: "Everything in one place", text: "Students, teachers, classes, exams and communication, all in a single system." },
  { title: "A portal for every role", text: "Admins, teachers and students each see only what they need." },
  { title: "Less paperwork", text: "Replace registers, notice boards and spreadsheets with one simple platform." },
  { title: "Secure access", text: "Every user signs in with their own account and role-based permissions." },
];

const STEPS = [
  { title: "Create your account", text: "Students and teachers register with their name, email and a password." },
  { title: "Sign in to your portal", text: "You are taken straight to the dashboard for your role." },
  { title: "Start using it", text: "Check attendance, results, assignments and announcements." },
];

export default function Landing() {
  const { user, loading } = useAuth();
  // Signed-in visitors still see this page first, with a shortcut back to their dashboard.
  const dash = user && (
    <Link to={`/${user.role}/`} className="btn lp-big">Go to my dashboard</Link>
  );
  return (
    <div className="lp">
      <header className="lp-nav">
        <a href="#home" className="lp-brand">{SCHOOL_NAME}</a>
        <nav className="lp-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#benefits">Benefits</a>
          <a href="#start">How to Get Started</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="lp-nav-actions">
          {loading ? null : user ? (
            <Link to={`/${user.role}/`} className="btn">My dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn secondary">Sign in</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </header>

      <section id="home" className="lp-hero">
        <div className="lp-hero-text">
          <p className="lp-eyebrow">Welcome to</p>
          <h1>
            A complete <span className="lp-accent">school management</span> system
          </h1>
          <p className="lp-lead">
            Everything you need, from classes and attendance to exams and
            communication, in one place.
          </p>
          <div className="lp-cta">
            {loading ? null : user ? dash : (
              <>
                <Link to="/register" className="btn lp-big">Create an account</Link>
                <Link to="/login" className="btn secondary lp-big">Sign in</Link>
              </>
            )}
            <a href="#features" className="btn secondary lp-big">Explore features</a>
          </div>
        </div>
      </section>

      <section id="features" className="lp-section">
        <h2>Features</h2>
        <p className="lp-sub">Tools for the whole school community.</p>
        <div className="lp-grid">
          {FEATURES.map((f) => (
            <div className="card lp-card" key={f.title}>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="benefits" className="lp-section">
        <h2>Benefits</h2>
        <p className="lp-sub">Why schools choose one connected system.</p>
        <div className="lp-grid">
          {BENEFITS.map((b) => (
            <div className="card lp-card" key={b.title}>
              <h3>{b.title}</h3>
              <p className="muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="start" className="lp-section">
        <h2>How to get started</h2>
        <p className="lp-sub">Three simple steps.</p>
        <div className="lp-grid">
          {STEPS.map((s, i) => (
            <div className="card lp-card" key={s.title}>
              <span className="lp-step">{i + 1}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="lp-cta lp-center">
          {loading ? null : user ? dash : (
            <>
              <Link to="/register" className="btn lp-big">Create an account</Link>
              <Link to="/login" className="btn secondary lp-big">I already have an account</Link>
            </>
          )}
        </div>
      </section>

      <section id="contact" className="lp-section">
        <h2>Contact</h2>
        <div className="card lp-contact">
          <div><span className="muted">Email</span><br />{CONTACT.email}</div>
          <div><span className="muted">Phone</span><br />{CONTACT.phone}</div>
          <div><span className="muted">Address</span><br />{CONTACT.address}</div>
        </div>
      </section>

      <footer className="lp-footer">
        &copy; {new Date().getFullYear()} {SCHOOL_NAME}
      </footer>
    </div>
  );
}