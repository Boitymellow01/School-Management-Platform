import { useState } from "react";
import { api } from "../api";
import Card from "./Card";

export default function ExamForm({ classes, onCreated }) {
  const [f, setF] = useState({ title: "", subject: "", class: "", date: "", totalMarks: 100 });
  const [msg, setMsg] = useState("");
  async function submit(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/exams", { ...f, totalMarks: Number(f.totalMarks) }); setF({ title: "", subject: "", class: "", date: "", totalMarks: 100 }); onCreated(); }
    catch (err) { setMsg(err.message); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Card title="Schedule exam">
      <form className="form grid" onSubmit={submit}>
        <label>Title<input value={f.title} onChange={set("title")} required /></label>
        <label>Subject<input value={f.subject} onChange={set("subject")} /></label>
        <label>Class<select value={f.class} onChange={set("class")} required><option value="">Select…</option>{classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
        <label>Date<input type="date" value={f.date} onChange={set("date")} required /></label>
        <label>Total marks<input type="number" min="1" value={f.totalMarks} onChange={set("totalMarks")} required /></label>
        <div className="row"><button className="btn">Create</button></div>
      </form>
      {msg && <p className="error">{msg}</p>}
    </Card>
  );
}
