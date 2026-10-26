import { useAuth } from "../../context/AuthContext";
import { useFetch, fmtDate } from "../../hooks";
import Card, { Stat } from "../../components/Card";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: att } = useFetch("/attendance/me");
  const { data: exams } = useFetch("/exams");
  const s = att?.summary;
  const rate = s?.total ? Math.round(((s.present + s.late) / s.total) * 100) + "%" : "–";
  const upcoming = exams?.filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).reverse();
  return (
    <>
      <h2>Welcome, {user.name}</h2>
      <div className="stats"><Stat label="Attendance" value={rate} /><Stat label="Days absent" value={s?.absent} /><Stat label="Upcoming exams" value={upcoming?.length} /></div>
      <Card title="Upcoming exams">
        {upcoming?.length ? <ul>{upcoming.map((e) => <li key={e._id}>{e.title} ({e.subject}) — {fmtDate(e.date)}</li>)}</ul> : <p className="muted">None scheduled.</p>}
      </Card>
    </>
  );
}
