import { useFetch, fmtDate } from "../../hooks";
import Card from "../../components/Card";

export default function MyExams() {
  const { data, error } = useFetch("/exams");
  return (
    <>
      <h2>My exams</h2>
      {error && <p className="error">{error}</p>}
      <Card>
        <table><thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Mark</th><th>%</th></tr></thead><tbody>
          {data?.map((e) => (
            <tr key={e._id}><td>{e.title}</td><td>{e.subject}</td><td>{fmtDate(e.date)}</td>
              <td>{e.marks == null ? "pending" : `${e.marks} / ${e.totalMarks}`}</td>
              <td>{e.marks == null ? "–" : Math.round((e.marks / e.totalMarks) * 100) + "%"}</td></tr>
          ))}
          {data?.length === 0 && <tr><td colSpan={5} className="muted">No exams.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
