import { useState } from "react";
import { useFetch } from "../../hooks";
import Card from "../../components/Card";

// Staff directory (read-only).
export default function TeacherTeachers() {
  const { data, error } = useFetch("/teachers/directory");
  const [q, setQ] = useState("");
  const rows = data?.filter((t) => !q || `${t.name} ${t.subject}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h2>Teachers</h2>
      {error && <p className="error">{error}</p>}
      <Card><label>Search<input placeholder="Name or subject" value={q} onChange={(e) => setQ(e.target.value)} /></label></Card>
      <Card>
        <table>
          <thead><tr><th>Name</th><th>Subject</th><th>Email</th><th>Phone</th></tr></thead>
          <tbody>
            {rows?.map((t) => <tr key={t.id}><td>{t.name}</td><td>{t.subject}</td><td>{t.email}</td><td>{t.phone}</td></tr>)}
            {rows?.length === 0 && <tr><td colSpan={4} className="muted">No teachers found.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
