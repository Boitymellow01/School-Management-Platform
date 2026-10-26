import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import Card from "../../components/Card";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function StudentAssignments() {
  const { data, error, reload } = useFetch("/assignments");
  return (
    <>
      <h2>My assignments</h2>
      {error && <p className="error">{error}</p>}
      {data?.length === 0 && <p className="muted">No assignments yet.</p>}
      {data?.map((a) => <AssignmentCard key={a._id} a={a} onSaved={reload} />)}
    </>
  );
}

function AssignmentCard({ a, onSaved }) {
  const [text, setText] = useState(a.mine?.text || "");
  const [msg, setMsg] = useState("");
  const graded = a.mine && a.mine.grade !== null && a.mine.grade !== undefined;
  const overdue = !a.mine && todayStr() > a.dueDate;
  const status = graded ? "graded" : a.mine ? "submitted" : overdue ? "overdue" : "due";

  async function submit(e) {
    e.preventDefault(); setMsg("");
    try { const r = await api.post(`/assignments/${a._id}/submit`, { text }); setMsg(r.late ? "Submitted (late) ✓" : "Submitted ✓"); onSaved(); }
    catch (err) { setMsg(err.message); }
  }

  return (
    <Card title={a.title} action={<span className={`pill ${status}`}>{status}</span>}>
      <p className="muted">{a.subject ? `${a.subject} · ` : ""}Due {a.dueDate} · out of {a.totalMarks}</p>
      {a.description && <p>{a.description}</p>}
      {graded ? (
        <>
          <p><strong>{a.mine.grade} / {a.totalMarks}</strong> ({Math.round((a.mine.grade / a.totalMarks) * 100)}%)</p>
          {a.mine.feedback && <p>Teacher feedback: {a.mine.feedback}</p>}
          <p className="muted" style={{ whiteSpace: "pre-wrap" }}>Your answer: {a.mine.text}</p>
        </>
      ) : (
        <form className="form" onSubmit={submit}>
          <textarea rows={4} placeholder="Write your answer…" value={text} onChange={(e) => setText(e.target.value)} required />
          <div className="row"><button className="btn">{a.mine ? "Resubmit" : "Submit"}</button></div>
        </form>
      )}
      {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
    </Card>
  );
}
