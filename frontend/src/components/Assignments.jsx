import { useState } from "react";
import { api } from "../api";
import { useFetch, fmtDate, today } from "../hooks";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";

const blank = { title: "", subject: "", class: "", dueDate: "", description: "" };

// Shared by all roles. Admin/teacher (canPost) can create; students just read.
export default function Assignments({ canPost }) {
  const { user } = useAuth();
  const { data, error, reload } = useFetch("/assignments");
  const { data: classes } = useFetch(canPost ? "/classes" : null);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function post(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/assignments", form); setForm(blank); reload(); }
    catch (err) { setMsg(err.message); }
  }
  async function remove(id) {
    if (!confirm("Delete this assignment?")) return;
    try { await api.del(`/assignments/${id}`); reload(); } catch (err) { setMsg(err.message); }
  }
  const overdue = (d) => d.slice(0, 10) < today();

  return (
    <>
      <h2>Assignments</h2>
      {canPost && (
        <Card title="New assignment">
          <form className="form grid" onSubmit={post}>
            <label>Title<input value={form.title} onChange={set("title")} required /></label>
            <label>Subject<input value={form.subject} onChange={set("subject")} /></label>
            <label>Class
              <select value={form.class} onChange={set("class")} required>
                <option value="">— choose —</option>
                {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Due date<input type="date" value={form.dueDate} onChange={set("dueDate")} required /></label>
            <label style={{ gridColumn: "1 / -1" }}>Instructions
              <textarea rows={3} value={form.description} onChange={set("description")} />
            </label>
            <div className="row"><button className="btn">Post assignment</button></div>
          </form>
        </Card>
      )}
      {(error || msg) && <p className="error">{error || msg}</p>}
      {data?.length === 0 && <p className="muted">No assignments yet.</p>}
      {data?.map((a) => (
        <Card key={a._id} title={a.title} action={
          canPost && (user.role === "admin" || a.createdBy?._id === user.id) && <button className="btn danger sm" onClick={() => remove(a._id)}>Delete</button>
        }>
          {a.description && <p>{a.description}</p>}
          <p className="muted">
            {a.subject ? `${a.subject} · ` : ""}{a.class?.name} · by {a.createdBy?.name} · due {fmtDate(a.dueDate)}{" "}
            <span className={`pill ${overdue(a.dueDate) ? "absent" : "present"}`}>{overdue(a.dueDate) ? "past due" : "open"}</span>
          </p>
        </Card>
      ))}
    </>
  );
}
