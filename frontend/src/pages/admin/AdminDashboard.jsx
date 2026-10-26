import { useFetch } from "../../hooks";
import { Stat } from "../../components/Card";
import Card from "../../components/Card";

export default function AdminDashboard() {
  const { data: s, error } = useFetch("/stats");
  const { data: att } = useFetch("/attendance/summary");
  return (
    <>
      <h2>Admin dashboard</h2>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <Stat label="Students" value={s?.students} /><Stat label="Teachers" value={s?.teachers} />
        <Stat label="Classes" value={s?.classes} /><Stat label="Exams" value={s?.exams} />
      </div>
      <Card title="Attendance rate by class">
        <table><thead><tr><th>Class</th><th>Rate</th></tr></thead><tbody>
          {att?.map((a) => <tr key={a.class}><td>{a.name}</td><td>{a.rate === null ? "no data" : `${a.rate}%`}</td></tr>)}
        </tbody></table>
      </Card>
    </>
  );
}
