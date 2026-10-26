import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import Card from "../../components/Card";

// Students in the grades this teacher teaches, plus anyone already in one of their classes.
// The teacher can put a student into one of their own classes (needed for attendance and marks).
export default function MyStudents() {
  const { data: classes } = useFetch("/classes");
  const { data: me } = useFetch("/auth/profile");
  const { data, error, reload } = useFetch("/students");
  const [grade, setGrade] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });

  const myClassIds = (classes || []).map((c) => c._id);
  const rows = data?.filter((s) =>
    (!grade || s.grade === grade) &&
    (!q || `${s.user?.name} ${s.studentNumber}`.toLowerCase().includes(q.toLowerCase())));

  async function enroll(student, classId) {
    setMsg({ text: "", ok: true });
    try { await api.put(`/students/${student._id}/enroll`, { class: classId }); setMsg({ text: `Updated ${student.user?.name}`, ok: true }); reload(); }
    catch (e) { setMsg({ text: e.message, ok: false }); }
  }

  return (
    <>
      <h2>My students</h2>
      {me && !me.grades?.length && <p className="error">You haven't chosen the grades you teach yet - set them under Profile.</p>}
      {error && <p className="error">{error}</p>}
      <Card>
        <div className="form grid">
          <label>Search<input placeholder="Name or student number" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <label>Grade
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">All my grades</option>
              {(me?.grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>
        {msg.text && <p className={msg.ok ? "ok" : "error"}>{msg.text}</p>}
      </Card>
      <Card>
        <table>
          <thead><tr><th>No.</th><th>Name</th><th>Email</th><th>Grade</th><th>Class</th></tr></thead>
          <tbody>
            {rows?.map((s) => {
              const mine = s.class && myClassIds.includes(s.class._id);
              const free = !s.class;
              return (
                <tr key={s._id}><td>{s.studentNumber}</td><td>{s.user?.name}</td><td>{s.user?.email}</td><td>{s.grade || "–"}</td>
                  <td>{mine || free ? (
                    <select value={s.class?._id || ""} onChange={(e) => enroll(s, e.target.value)} style={{ width: "auto" }}>
                      <option value="">— not in a class —</option>
                      {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  ) : <span className="muted">{s.class?.name}</span>}</td></tr>
              );
            })}
            {rows?.length === 0 && <tr><td colSpan={5} className="muted">No students found in your grades yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
