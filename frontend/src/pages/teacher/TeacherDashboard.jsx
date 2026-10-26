import { useAuth } from "../../context/AuthContext";
import { useFetch, fmtDate } from "../../hooks";
import Card, { Stat } from "../../components/Card";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: classes } = useFetch("/classes");
  const { data: exams } = useFetch("/exams");
  const upcoming = exams?.filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).reverse();
  return (
    <>
      <h2>Welcome, {user.name}</h2>
      <div className="stats">
        <Stat label="My classes" value={classes?.length} />
        <Stat label="Students taught" value={classes?.reduce((n, c) => n + c.studentCount, 0)} />
        <Stat label="Upcoming exams" value={upcoming?.length} />
      </div>
      <Card title="Upcoming exams">
        {upcoming?.length ? <ul>{upcoming.map((e) => <li key={e._id}>{e.title} — {e.class?.name} — {fmtDate(e.date)}</li>)}</ul> : <p className="muted">None scheduled.</p>}
      </Card>
    </>
  );
}
