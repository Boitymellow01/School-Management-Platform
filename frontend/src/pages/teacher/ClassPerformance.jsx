import { useState } from "react";
import { useFetch, fmtDate } from "../../hooks";
import Card, { Stat } from "../../components/Card";

const Bar = ({ value }) => <div className="bar"><span style={{ width: `${Math.min(100, value ?? 0)}%` }} /></div>;

// Used by teachers (their own classes) and admin (all classes).
export default function ClassPerformance() {
  const { data: classes } = useFetch("/classes");
  const [cls, setCls] = useState("");
  const { data, error } = useFetch(cls ? `/performance/class/${cls}` : null);
  return (
    <>
      <h2>Class performance</h2>
      <Card>
        <label>Class
          <select value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value="">— choose a class —</option>
            {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
      </Card>
      {error && <p className="error">{error}</p>}
      {cls && data && (
        <>
          <div className="stats">
            <Stat label="Class average" value={data.classAverage != null ? data.classAverage + "%" : null} />
            <Stat label="Students" value={data.students.length} />
            <Stat label="Exams" value={data.exams.length} />
          </div>
          <Card title="Students">
            <table><thead><tr><th>No.</th><th>Name</th><th>Exams taken</th><th>Average</th><th style={{ width: "35%" }} /></tr></thead><tbody>
              {data.students.map((s) => (
                <tr key={s._id}><td>{s.studentNumber}</td><td>{s.name}</td><td>{s.examsTaken}</td>
                  <td>{s.average != null ? s.average + "%" : "–"}</td><td><Bar value={s.average} /></td></tr>
              ))}
              {!data.students.length && <tr><td colSpan={5} className="muted">No students in this class.</td></tr>}
            </tbody></table>
          </Card>
          <Card title="Exams">
            <table><thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Marks entered</th><th>Average</th></tr></thead><tbody>
              {data.exams.map((e) => (
                <tr key={e._id}><td>{e.title}</td><td>{e.subject}</td><td>{fmtDate(e.date)}</td><td>{e.entered}</td>
                  <td>{e.average != null ? e.average + "%" : "–"}</td></tr>
              ))}
              {!data.exams.length && <tr><td colSpan={5} className="muted">No exams yet.</td></tr>}
            </tbody></table>
          </Card>
        </>
      )}
    </>
  );
}
