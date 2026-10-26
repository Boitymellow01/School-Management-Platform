import { useFetch, fmtDate } from "../../hooks";
import Card, { Stat } from "../../components/Card";
import { Bar, pctText } from "../../components/StaffPerformance";

export default function StudentPerformance() {
  const { data, error } = useFetch("/performance/me");
  return (
    <>
      <h2>My performance</h2>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <Stat label="Average mark" value={pctText(data?.average)} />
        <Stat label="Attendance" value={pctText(data?.attendanceRate)} />
        <Stat label="Exams written" value={data?.exams.filter((e) => e.marks !== null).length} />
      </div>
      <div className="grid-2">
        <Card title="By subject">
          <table>
            <thead><tr><th>Subject</th><th>You</th><th>Class</th><th /></tr></thead>
            <tbody>
              {data?.subjects.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{pctText(s.average)}</td><td>{pctText(s.classAverage)}</td><td><Bar value={s.average} /></td></tr>)}
              {data?.subjects.length === 0 && <tr><td colSpan={4} className="muted">No marks yet.</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card title="Exam results">
          <table>
            <thead><tr><th>Exam</th><th>Date</th><th>Mark</th></tr></thead>
            <tbody>
              {data?.exams.map((e) => (
                <tr key={e._id}><td>{e.title}<div className="muted">{e.subject}</div></td><td>{fmtDate(e.date)}</td>
                  <td>{e.marks === null ? "pending" : `${e.marks}/${e.totalMarks} (${e.percent}%)`}</td></tr>
              ))}
              {data?.exams.length === 0 && <tr><td colSpan={3} className="muted">No exams yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
