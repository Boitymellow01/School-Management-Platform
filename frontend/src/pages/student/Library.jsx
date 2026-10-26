import { useState } from "react";
import { api } from "../../api";
import { useFetch, fmtDate } from "../../hooks";
import Card from "../../components/Card";

export default function Library() {
  const { data: books, reload, error } = useFetch("/library/books");
  const { data: loans, reload: reloadLoans } = useFetch("/library/loans/me");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [q, setQ] = useState("");

  async function act(path, okText) {
    setMsg({ text: "", ok: true });
    try { await api.post(path); setMsg({ text: okText, ok: true }); reload(); reloadLoans(); }
    catch (e) { setMsg({ text: e.message, ok: false }); }
  }
  const overdue = (l) => !l.returnedAt && new Date(l.dueDate) < new Date();
  const shown = (books || []).filter((b) => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q.toLowerCase()));
  const current = loans?.filter((l) => !l.returnedAt) || [];

  return (
    <>
      <h2>Library</h2>
      {error && <p className="error">{error}</p>}
      {msg.text && <p className={msg.ok ? "ok" : "error"}>{msg.text}</p>}
      <Card title={`My borrowed books (${current.length}/3)`}>
        <table><thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th /></tr></thead><tbody>
          {current.map((l) => (
            <tr key={l._id}><td>{l.book?.title}</td><td>{fmtDate(l.borrowedAt)}</td>
              <td>{fmtDate(l.dueDate)} {overdue(l) && <span className="pill absent">overdue</span>}</td>
              <td className="actions"><button className="btn secondary sm" onClick={() => act(`/library/loans/${l._id}/return`, "Book returned")}>Return</button></td></tr>
          ))}
          {loans && !current.length && <tr><td colSpan={4} className="muted">You have no books out. Loans last 14 days.</td></tr>}
        </tbody></table>
      </Card>
      <Card title="Books">
        <input placeholder="Search title, author or category…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        <table><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th /></tr></thead><tbody>
          {shown.map((b) => (
            <tr key={b._id}><td>{b.title}</td><td>{b.author}</td><td>{b.category}</td><td>{b.available} / {b.copies}</td>
              <td className="actions">{b.borrowedByMe
                ? <span className="pill late">you have it</span>
                : <button className="btn sm" disabled={b.available < 1} onClick={() => act(`/library/books/${b._id}/borrow`, `Borrowed "${b.title}"`)}>Borrow</button>}</td></tr>
          ))}
          {books && !shown.length && <tr><td colSpan={5} className="muted">No books found.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
