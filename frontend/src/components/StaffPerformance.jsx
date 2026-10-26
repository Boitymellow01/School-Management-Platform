import { useState } from "react";
import { useFetch } from "../hooks";
import Card, { Stat } from "./Card";

export const Bar = ({ value }) => (
  <div className="bar" role="img" aria-label={`${value ?? 0}%`}><span style={{ width: `${Math.min(100, value ?? 0)}%` }} /></div>
);
export const pctText = (v) => (v == null ? "–" : `${v}%`);

// Admin + teacher: class-by-class results and attendance. Admin also gets a school-wide overview.
export default function StaffPerformance({ admin }) {
  const { data: classes } = useFetch("/classes");
  const { data: overview } = useFetch(admin ? "/performance/overview" : null);
  const [cls, setCls] = useState("");
  const { data: report, error } = useFetch(cls ? `/performance/class/${cls}` : null);

  return (
    <>
      <h2>Performance</h2>
      {admin && (
        <Card title="All classes">
          <table>
            <thead><tr><th>Class</th><th>Students</th><th>Average mark</th><th>Attendance</th><th /></tr></thead>
            <tbody>
              {overview?.map((o) => (
                <tr key={o.class}>
                  <td>{o.name}</td><td>{o.students}</td><td>{pctText(o.classAverage)}</td><td>{pctText(o.attendanceRate)}</td>
                  <td className="actions"><button className="btn secondary sm" onClick={() => setCls(o.class)}>Details</button></td>
                </tr>
              ))}
              {overview?.length === 0 && <tr><td colSpan={5} className="muted">No classes yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
      <Card title="Class report">
        <label className="form">Class
          <select value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value="">Select a class…</option>
            {classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
      </Card>
      {cls && report && (
        <>
          <div className="stats">
            <Stat label="Students" value={report.students.length} />
            <Stat label="Class average" value={pctText(report.classAverage)} />
            <Stat label="Attendance" value={pctText(report.attendanceRate)} />
          </div>
          <div className="grid-2">
            <Card title="By subject">
              <table>
                <thead><tr><th>Subject</th><th>Average</th><th /></tr></thead>
                <tbody>
                  {report.subjects.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{pctText(s.average)}</td><td><Bar value={s.average} /></td></tr>)}
                  {report.subjects.length === 0 && <tr><td colSpan={3} className="muted">No marks entered yet.</td></tr>}
                </tbody>
              </table>
            </Card>
            <Card title="By student">
              <table>
                <thead><tr><th>Student</th><th>Average</th><th>Exams</th><th>Attendance</th></tr></thead>
                <tbody>
                  {report.students.map((s) => (
                    <tr key={s.student}><td>{s.name}<div className="muted">{s.studentNumber}</div></td><td>{pctText(s.average)}</td><td>{s.examsTaken}</td><td>{pctText(s.attendanceRate)}</td></tr>
                  ))}
                  {report.students.length === 0 && <tr><td colSpan={4} className="muted">No students in this class.</td></tr>}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
