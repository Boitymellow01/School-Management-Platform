import { useFetch } from "../../hooks";
import Card from "../../components/Card";

// Read-only list of colleagues.
export default function TeachersDirectory() {
  const { data, error } = useFetch("/teachers/directory");
  return (
    <>
      <h2>Teachers</h2>
      {error && <p className="error">{error}</p>}
      <Card>
        <table><thead><tr><th>Name</th><th>Subject</th><th>Grades</th><th>Email</th></tr></thead><tbody>
          {data?.map((t) => <tr key={t._id}><td>{t.name}</td><td>{t.subject || "–"}</td><td>{(t.grades || []).map((g) => g.replace("Grade ", "")).join(", ") || "–"}</td><td>{t.email}</td></tr>)}
          {data?.length === 0 && <tr><td colSpan={4} className="muted">No teachers yet.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
