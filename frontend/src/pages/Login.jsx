import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}/`} replace />;

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const u = await login(email, password);
      nav(`/${u.role}/`);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <Link to="/" className="muted">&larr; Back to home</Link>
        <h2>School Management Platform</h2>
        <p className="muted">Sign in to continue</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="muted">New student or teacher? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
