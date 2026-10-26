import { useEffect, useState } from "react";
import { api } from "../api";
import { useFetch, fmtDate } from "../hooks";
import Card from "./Card";

const blank = { title: "", subject: "", class: "", dueDate: "", totalMarks: 100, description: "" };

// Admin + teacher: create assignments, see submissions, grade them.
export default function AssignmentManager() {
  const { data, error, reload } = useFetch("/assignments");
  const { data: classes } = useFetch("/classes");
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");
  const [openId, setOpenId] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function create(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/assignments", { ...f, totalMarks: Number(f.totalMarks) }); setF(blank); reload(); }
    catch (err) { setMsg(err.message); }
  }
  async function remove(a) {
    if (!confirm(`Delete "${a.title}" and all its submissions?`)) return;
    try { await api.del(`/assignments/${a._id}`); if (openId === a._id) setOpenId(null); reload(); }
    catch (err) { setMsg(err.message); }
  }
  const open = data?.find((a) => a._id === openId);

  return (
    <>
      <h2>Assignments</h2>
      <Card title="New assignment">
        <form className="form grid" onSubmit={create}>
          <label>Title<input value={f.title} onChange={set("title")} required /></label>
          <label>Subject<input value={f.subject} onChange={set("subject")} /></label>
          <label>Class
            <select value={f.class} onChange={set("class")} required>
              <option value="">Select…</option>
              {classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <label>Due date<input type="date" value={f.dueDate} onChange={set("dueDate")} required /></label>
          <label>Total marks<input type="number" min="1" value={f.totalMarks} onChange={set("totalMarks")} required /></label>
          <label>Instructions<input value={f.description} onChange={set("description")} /></label>
          <div className="row"><button className="btn">Create</button></div>
        </form>
        {(msg || error) && <p className="error">{msg || error}</p>}
      </Card>
      <Card>
        <table>
          <thead><tr><th>Title</th><th>Class</th><th>Due</th><th>Submitted</th><th /></tr></thead>
          <tbody>
            {data?.map((a) => (
              <tr key={a._id}>
                <td>{a.title}{a.subject ? <span className="muted"> · {a.subject}</span> : null}</td>
                <td>{a.class?.name}</td><td>{a.dueDate}</td><td>{a.submissionCount}</td>
                <td className="actions">
                  <button className="btn secondary sm" onClick={() => setOpenId(a._id === openId ? null : a._id)}>{a._id === openId ? "Hide" : "Grade"}</button>{" "}
                  <button className="btn danger sm" onClick={() => remove(a)}>Delete</button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={5} className="muted">No assignments yet.</td></tr>}
          </tbody>
        </table>
      </Card>
      {open && <Submissions key={open._id} assignment={open} onSaved={reload} />}
    </>
  );
}

function Submissions({ assignment, onSaved }) {
  const { data, error, reload } = useFetch(`/assignments/${assignment._id}/submissions`);
  const [edits, setEdits] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (data) setEdits(Object.fromEntries(data.roster.filter((r) => r.submission).map((r) => [r.student, { grade: r.submission.grade ?? "", feedback: r.submission.feedback || "" }])));
  }, [data]);

  async function save(student) {
    setMsg("");
    const e = edits[student];
    try { await api.put(`/assignments/${assignment._id}/grade`, { student, grade: e.grade, feedback: e.feedback }); setMsg("Saved ✓"); reload(); onSaved(); }
    catch (err) { setMsg(err.message); }
  }
  const setEdit = (id, k, v) => setEdits({ ...edits, [id]: { ...edits[id], [k]: v } });

  return (
    <Card title={`${assignment.title} — submissions (out of ${assignment.totalMarks})`}>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Student</th><th>Status</th><th>Answer</th><th>Mark</th><th>Feedback</th><th /></tr></thead>
        <tbody>
          {data?.roster.map((r) => {
            const s = r.submission, e = edits[r.student];
            return (
              <tr key={r.student}>
                <td>{r.name}<div className="muted">{r.studentNumber}</div></td>
                <td>{s ? <span className={`pill ${s.late ? "late" : "present"}`}>{s.late ? "late" : "on time"}</span> : <span className="muted">not submitted</span>}
                  {s && <div className="muted">{fmtDate(s.submittedAt)}</div>}</td>
                <td style={{ maxWidth: 260, whiteSpace: "pre-wrap" }}>{s?.text}</td>
                <td>{s && e && <input type="number" min="0" max={assignment.totalMarks} value={e.grade} onChange={(ev) => setEdit(r.student, "grade", ev.target.value)} />}</td>
                <td>{s && e && <input value={e.feedback} onChange={(ev) => setEdit(r.student, "feedback", ev.target.value)} />}</td>
                <td className="actions">{s && <button className="btn sm" onClick={() => save(r.student)}>Save</button>}</td>
              </tr>
            );
          })}
          {data?.roster.length === 0 && <tr><td colSpan={6} className="muted">No students in this class.</td></tr>}
        </tbody>
      </table>
      {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
    </Card>
  );
}
