import { useFetch, fmtDate } from "../../hooks";
import Card, { Stat } from "../../components/Card";

const Bar = ({ value }) => <div className="bar"><span style={{ width: `${Math.min(100, value ?? 0)}%` }} /></div>;

export default function MyPerformance() {
  const { data, error } = useFetch("/performance/me");
  const best = data?.subjects?.length ? [...data.subjects].sort((a, b) => b.average - a.average)[0] : null;
  return (
    <>
      <h2>My performance</h2>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <Stat label="Overall average" value={data?.overall != null ? data.overall + "%" : null} />
        <Stat label="Exams marked" value={data?.exams?.length} />
        <Stat label="Strongest subject" value={best?.subject} />
      </div>
      <Card title="By subject">
        <table><thead><tr><th>Subject</th><th>Exams</th><th>Average</th><th style={{ width: "40%" }} /></tr></thead><tbody>
          {data?.subjects?.map((s) => (
            <tr key={s.subject}><td>{s.subject}</td><td>{s.exams}</td><td>{s.average}%</td><td><Bar value={s.average} /></td></tr>
          ))}
          {data && !data.subjects.length && <tr><td colSpan={4} className="muted">No marks yet.</td></tr>}
        </tbody></table>
      </Card>
      <Card title="Exam results">
        <table><thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Mark</th><th>%</th><th>Class avg</th></tr></thead><tbody>
          {data?.exams?.map((e) => (
            <tr key={e._id}><td>{e.title}</td><td>{e.subject}</td><td>{fmtDate(e.date)}</td>
              <td>{e.marks} / {e.totalMarks}</td><td>{e.percent}%</td>
              <td>{e.classAverage != null ? e.classAverage + "%" : "–"}{" "}
                <span className={`pill ${e.percent >= e.classAverage ? "present" : "late"}`}>{e.percent >= e.classAverage ? "above" : "below"}</span></td></tr>
          ))}
          {data && !data.exams.length && <tr><td colSpan={6} className="muted">No marks yet.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
