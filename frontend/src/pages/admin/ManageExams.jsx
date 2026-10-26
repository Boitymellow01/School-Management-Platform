import { useState } from "react";
import { api } from "../../api";
import { useFetch, fmtDate } from "../../hooks";
import Card from "../../components/Card";
import ExamForm from "../../components/ExamForm";

export default function ManageExams() {
  const { data, reload, error } = useFetch("/exams");
  const { data: classes } = useFetch("/classes");
  const [msg, setMsg] = useState("");
  async function remove(id) {
    if (!confirm("Delete this exam and its marks?")) return;
    try { await api.del(`/exams/${id}`); reload(); } catch (e) { setMsg(e.message); }
  }
  return (
    <>
      <h2>Exams</h2>
      <ExamForm classes={classes} onCreated={reload} />
      {(error || msg) && <p className="error">{error || msg}</p>}
      <Card>
        <table><thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Date</th><th>Total</th><th>Marked</th><th /></tr></thead><tbody>
          {data?.map((e) => (
            <tr key={e._id}><td>{e.title}</td><td>{e.subject}</td><td>{e.class?.name}</td><td>{fmtDate(e.date)}</td><td>{e.totalMarks}</td><td>{e.results?.length || 0}</td>
              <td><button className="btn danger sm" onClick={() => remove(e._id)}>Delete</button></td></tr>
          ))}
          {data?.length === 0 && <tr><td colSpan={7} className="muted">No exams.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
