import { useFetch } from "../../hooks";
import Card, { Stat } from "../../components/Card";

export default function MyAttendance() {
  const { data, error } = useFetch("/attendance/me");
  const s = data?.summary;
  return (
    <>
      <h2>My attendance</h2>
      {error && <p className="error">{error}</p>}
      <div className="stats"><Stat label="Present" value={s?.present} /><Stat label="Late" value={s?.late} /><Stat label="Absent" value={s?.absent} /></div>
      <Card>
        <table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>
          {data?.records.map((r) => <tr key={r.date}><td>{r.date}</td><td><span className={`pill ${r.status}`}>{r.status}</span></td></tr>)}
          {data?.records.length === 0 && <tr><td colSpan={2} className="muted">No records yet.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
