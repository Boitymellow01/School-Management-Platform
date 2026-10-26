import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";
import { GRADES } from "../grades";
import GradePicker from "./GradePicker";

// Shared by all roles: edit your details and change your password.
export default function Profile() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [pw, setPw] = useState({ current: "", next: "", again: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });

  useEffect(() => { api.get("/auth/profile").then(setP).catch((e) => setMsg({ text: e.message, ok: false })); }, []);
  if (!p) return <p className="muted">{msg.text || "Loading…"}</p>;
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setMsg({ text: "", ok: true });
    try {
      const u = await api.put("/auth/profile", { name: p.name, email: p.email, subject: p.subject, phone: p.phone, grade: p.grade, grades: p.grades });
      setUser({ ...user, name: u.name, email: u.email });
      setMsg({ text: "Profile saved", ok: true });
    } catch (err) { setMsg({ text: err.message, ok: false }); }
  }
  async function changePw(e) {
    e.preventDefault(); setPwMsg({ text: "", ok: true });
    if (pw.next !== pw.again) return setPwMsg({ text: "New passwords do not match", ok: false });
    try {
      await api.put("/auth/password", { current: pw.current, next: pw.next });
      setPw({ current: "", next: "", again: "" });
      setPwMsg({ text: "Password updated", ok: true });
    } catch (err) { setPwMsg({ text: err.message, ok: false }); }
  }

  return (
    <>
      <h2>My profile</h2>
      <Card title="Details">
        <form className="form grid" onSubmit={save}>
          <label>Name<input value={p.name} onChange={set("name")} required /></label>
          <label>Email<input type="email" value={p.email} onChange={set("email")} required /></label>
          {p.role === "teacher" && <>
            <label>Subject<input value={p.subject} onChange={set("subject")} /></label>
            <label>Phone<input value={p.phone} onChange={set("phone")} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Grades you teach
              <GradePicker value={p.grades || []} onChange={(g) => setP({ ...p, grades: g })} />
            </label>
          </>}
          {p.role === "student" && <>
            <label>Student number<input value={p.studentNumber} disabled /></label>
            <label>Grade
              <select value={p.grade || ""} onChange={set("grade")} required>
                <option value="">— choose —</option>
                {p.grade && !GRADES.includes(p.grade) && <option value={p.grade}>{p.grade} (old value)</option>}
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label>Class<input value={p.className || "Not assigned yet"} disabled /></label>
          </>}
          <div className="row"><button className="btn">Save changes</button></div>
        </form>
        {msg.text && <p className={msg.ok ? "ok" : "error"}>{msg.text}</p>}
      </Card>
      <Card title="Change password">
        <form className="form grid" onSubmit={changePw}>
          <label>Current password<input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></label>
          <label>New password<input type="password" minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
          <label>Repeat new password<input type="password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} required /></label>
          <div className="row"><button className="btn">Update password</button></div>
        </form>
        {pwMsg.text && <p className={pwMsg.ok ? "ok" : "error"}>{pwMsg.text}</p>}
      </Card>
    </>
  );
}
