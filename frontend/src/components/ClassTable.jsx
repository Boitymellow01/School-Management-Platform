import Card from "./Card";
export default function ClassTable({ classes, error }) {
  return (
    <>
      <h2>Classes</h2>
      {error && <p className="error">{error}</p>}
      <Card>
        <table>
          <thead><tr><th>Class</th><th>Grade</th><th>Teacher</th><th>Students</th></tr></thead>
          <tbody>
            {classes?.map((c) => (
              <tr key={c._id}><td>{c.name}</td><td>{c.grade}</td><td>{c.teacher?.user?.name || "–"}</td><td>{c.studentCount}</td></tr>
            ))}
            {classes?.length === 0 && <tr><td colSpan={4} className="muted">No classes.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
