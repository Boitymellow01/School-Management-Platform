import { useEffect, useState } from "react";
import { api } from "../api";
import { useFetch } from "../hooks";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";

// Shared by all roles: edit your name/email (and phone for teachers), change your password.
export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const { data, error } = useFetch("/auth/profile");
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => { if (data) setF({ name: data.name, email: data.email, phone: data.phone || "" }); }, [data]);

  async function save(e) {
    e.preventDefault(); setMsg("");
    try {
      const p = await api.put("/auth/profile", f);
      setUser({ ...user, name: p.name, email: p.email });
      setMsg("Saved ✓");
    } catch (err) { setMsg(err.message); }
  }
  async function changePassword(e) {
    e.preventDefault(); setPwMsg("");
    if (pw.next !== pw.confirm) return setPwMsg("The new passwords don't match");
    try {
      await api.put("/auth/password", { current: pw.current, next: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg("Password updated ✓");
    } catch (err) { setPwMsg(err.message); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setP = (k) => (e) => setPw({ ...pw, [k]: e.target.value });

  return (
    <>
      <h2>My profile</h2>
      {error && <p className="error">{error}</p>}
      <Card title="Details">
        <form className="form grid" onSubmit={save}>
          <label>Name<input value={f.name} onChange={set("name")} required /></label>
          <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>
          {user.role === "teacher" && <label>Phone<input value={f.phone} onChange={set("phone")} /></label>}
          <div className="row"><button className="btn">Save changes</button></div>
        </form>
        {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
        {data && user.role === "teacher" && <p className="muted">Subject: {data.subject || "not set"} (set by the administrator)</p>}
        {data && user.role === "student" && (
          <p className="muted">Student no. {data.studentNumber} · Grade {data.grade || "–"} · Class {data.className || "not assigned"} (set by the administrator)</p>
        )}
      </Card>
      <Card title="Change password">
        <form className="form grid" onSubmit={changePassword}>
          <label>Current password<input type="password" value={pw.current} onChange={setP("current")} required /></label>
          <label>New password<input type="password" minLength={6} value={pw.next} onChange={setP("next")} required /></label>
          <label>Confirm new password<input type="password" minLength={6} value={pw.confirm} onChange={setP("confirm")} required /></label>
          <div className="row"><button className="btn">Update password</button></div>
        </form>
        {pwMsg && <p className={pwMsg.includes("✓") ? "ok" : "error"}>{pwMsg}</p>}
      </Card>
    </>
  );
}
