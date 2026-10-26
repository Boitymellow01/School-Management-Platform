export default function Card({ title, children, action }) {
  return (
    <section className="card">
      {(title || action) && (
        <div className="card-head">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value ?? "–"}</div>
      <div className="muted">{label}</div>
    </div>
  );
}
