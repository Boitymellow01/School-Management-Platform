import { useState } from "react";
import { useFetch } from "../../hooks";
import Card from "../../components/Card";

// Students in the classes this teacher teaches (the server filters the list).
export default function TeacherStudents() {
  const { data, error } = useFetch("/students");
  const { data: classes } = useFetch("/classes");
  const [cls, setCls] = useState("");
  const [q, setQ] = useState("");
  const rows = data?.filter((s) =>
    (!cls || s.class?._id === cls) &&
    (!q || `${s.user?.name} ${s.studentNumber}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <h2>My students</h2>
      {error && <p className="error">{error}</p>}
      <Card>
        <div className="form grid">
          <label>Search<input placeholder="Name or student number" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <label>Class
            <select value={cls} onChange={(e) => setCls(e.target.value)}>
              <option value="">All my classes</option>
              {classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <Card>
        <table>
          <thead><tr><th>No.</th><th>Name</th><th>Email</th><th>Grade</th><th>Class</th></tr></thead>
          <tbody>
            {rows?.map((s) => <tr key={s._id}><td>{s.studentNumber}</td><td>{s.user?.name}</td><td>{s.user?.email}</td><td>{s.grade}</td><td>{s.class?.name}</td></tr>)}
            {rows?.length === 0 && <tr><td colSpan={5} className="muted">No students found.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
