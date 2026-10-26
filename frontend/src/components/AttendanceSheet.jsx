import { useEffect, useState } from "react";
import { api } from "../api";
import { today } from "../hooks";
import Card from "./Card";

// Used by admin and teacher: pick class + date, mark each student, save.
export default function AttendanceSheet({ classes }) {
  const [cls, setCls] = useState("");
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg(""); setRows([]);
    if (!cls) return;
    api.get(`/attendance?class=${cls}&date=${date}`).then((d) => { setRows(d.records); setSaved(d.saved); }).catch((e) => setMsg(e.message));
  }, [cls, date]);

  const setStatus = (id, status) => setRows(rows.map((r) => (r.student === id ? { ...r, status } : r)));

  async function save() {
    setMsg("");
    try { await api.put("/attendance", { class: cls, date, records: rows.map(({ student, status }) => ({ student, status })) }); setSaved(true); setMsg("Saved ✓"); }
    catch (e) { setMsg(e.message); }
  }

  return (
    <Card>
      <div className="form grid">
        <label>Class<select value={cls} onChange={(e) => setCls(e.target.value)}><option value="">Select…</option>{classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
        <label>Date<input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} /></label>
      </div>
      {cls && (
        <>
          {rows.length === 0 ? <p className="muted">No students in this class.</p> : (
            <table><thead><tr><th>No.</th><th>Student</th><th>Status</th></tr></thead><tbody>
              {rows.map((r) => (
                <tr key={r.student}><td>{r.studentNumber}</td><td>{r.name}</td>
                  <td>{["present", "late", "absent"].map((s) => (
                    <label key={s} className="radio"><input type="radio" name={r.student} checked={r.status === s} onChange={() => setStatus(r.student, s)} />{s}</label>
                  ))}</td></tr>
              ))}
            </tbody></table>
          )}
          {rows.length > 0 && <div className="row"><button className="btn" onClick={save}>{saved ? "Update attendance" : "Save attendance"}</button></div>}
        </>
      )}
      {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
    </Card>
  );
}
