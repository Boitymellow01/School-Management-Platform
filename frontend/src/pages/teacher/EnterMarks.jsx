import { useEffect, useState } from "react";
import { api } from "../../api";
import { useFetch, fmtDate } from "../../hooks";
import Card from "../../components/Card";
import ExamForm from "../../components/ExamForm";

export default function EnterMarks() {
  const { data: exams, reload } = useFetch("/exams");
  const { data: classes } = useFetch("/classes");
  const [examId, setExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [msg, setMsg] = useState("");
  const exam = exams?.find((e) => e._id === examId);

  useEffect(() => {
    setMsg(""); setStudents([]);
    if (!exam) return;
    api.get(`/students?class=${exam.class._id}`).then((s) => {
      setStudents(s);
      setMarks(Object.fromEntries((exam.results || []).map((r) => [r.student, r.marks])));
    }).catch((e) => setMsg(e.message));
  }, [examId, exams]);

  async function save() {
    setMsg("");
    const results = students.filter((s) => marks[s._id] !== undefined && marks[s._id] !== "").map((s) => ({ student: s._id, marks: Number(marks[s._id]) }));
    try { await api.put(`/exams/${examId}/marks`, { results }); setMsg("Saved ✓"); reload(); }
    catch (e) { setMsg(e.message); }
  }

  return (
    <>
      <h2>Enter marks</h2>
      <ExamForm classes={classes} onCreated={reload} />
      <Card title="Marks">
        <label className="form">Exam
          <select value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">Select an exam…</option>
            {exams?.map((e) => <option key={e._id} value={e._id}>{e.title} — {e.class?.name} — {fmtDate(e.date)}</option>)}
          </select>
        </label>
        {exam && (students.length === 0 ? <p className="muted">No students in this class.</p> : (
          <>
            <table><thead><tr><th>No.</th><th>Student</th><th>Marks (out of {exam.totalMarks})</th></tr></thead><tbody>
              {students.map((s) => (
                <tr key={s._id}><td>{s.studentNumber}</td><td>{s.user?.name}</td>
                  <td><input type="number" min="0" max={exam.totalMarks} value={marks[s._id] ?? ""} onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })} /></td></tr>
              ))}
            </tbody></table>
            <div className="row"><button className="btn" onClick={save}>Save marks</button></div>
          </>
        ))}
        {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
      </Card>
    </>
  );
}
