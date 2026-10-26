import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GRADES } from "../grades";
import GradePicker from "../components/GradePicker";

const blank = { name: "", email: "", password: "", confirm: "", studentNumber: "", grade: "", subject: "", phone: "" };

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState(blank);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to={`/${user.role}/`} replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (role === "teacher" && !grades.length) return setError("Choose at least one grade you teach");
    setBusy(true);
    try {
      const { confirm, ...body } = form;
      const u = await register({ ...body, grades, role });
      nav(`/${u.role}/`);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <Link to="/" className="muted">&larr; Back to home</Link>
        <h2>Create an account</h2>
        <div>
          <label className="radio"><input type="radio" checked={role === "student"} onChange={() => setRole("student")} /> student</label>
          <label className="radio"><input type="radio" checked={role === "teacher"} onChange={() => setRole("teacher")} /> teacher</label>
        </div>
        <label>Full name<input value={form.name} onChange={set("name")} required autoFocus /></label>
        <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label>
        {role === "student" ? (
          <>
            <label>Student number<input value={form.studentNumber} onChange={set("studentNumber")} required /></label>
            <label>Grade
              <select value={form.grade} onChange={set("grade")} required>
                <option value="">— choose your grade —</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </>
        ) : (
          <>
            <label>Subject<input value={form.subject} onChange={set("subject")} /></label>
            <div className="field">Grades you teach (you can choose more than one)</div>
            <GradePicker value={grades} onChange={setGrades} />
            <label>Phone<input value={form.phone} onChange={set("phone")} /></label>
          </>
        )}
        <label>Password (6+ characters)<input type="password" value={form.password} onChange={set("password")} required minLength={6} /></label>
        <label>Confirm password<input type="password" value={form.confirm} onChange={set("confirm")} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
        <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
