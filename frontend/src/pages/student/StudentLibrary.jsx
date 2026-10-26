import { useState } from "react";
import { api } from "../../api";
import { useFetch, fmtDate } from "../../hooks";
import Card from "../../components/Card";

export default function StudentLibrary() {
  const { data: books, error, reload } = useFetch("/library");
  const { data: loans, reload: reloadLoans } = useFetch("/library/my");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  async function act(book, what) {
    setMsg("");
    try { await api.post(`/library/${book._id}/${what}`); setMsg(what === "borrow" ? `Borrowed "${book.title}" ✓` : `Returned "${book.title}" ✓`); reload(); reloadLoans(); }
    catch (err) { setMsg(err.message); }
  }
  const shown = books?.filter((b) => !q || `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q.toLowerCase()));
  const current = loans?.filter((l) => !l.returnedAt);
  const past = loans?.filter((l) => l.returnedAt);
  const overdue = (l) => new Date(l.dueAt) < new Date();

  return (
    <>
      <h2>Library</h2>
      {(error || msg) && <p className={msg.includes("✓") ? "ok" : "error"}>{error || msg}</p>}
      <Card title="Books I have">
        <table>
          <thead><tr><th>Title</th><th>Due</th><th /></tr></thead>
          <tbody>
            {current?.map((l) => (
              <tr key={l.bookId}><td>{l.title}</td><td>{fmtDate(l.dueAt)} {overdue(l) && <span className="pill absent">overdue</span>}</td>
                <td className="actions"><button className="btn secondary sm" onClick={() => act({ _id: l.bookId, title: l.title }, "return")}>Return</button></td></tr>
            ))}
            {current?.length === 0 && <tr><td colSpan={3} className="muted">You haven't borrowed anything.</td></tr>}
          </tbody>
        </table>
      </Card>
      <Card title="Catalogue">
        <label className="form">Search<input placeholder="Title, author or category" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <table>
          <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th /></tr></thead>
          <tbody>
            {shown?.map((b) => (
              <tr key={b._id}><td>{b.title}</td><td>{b.author}</td><td>{b.category}</td><td>{b.available} of {b.copies}</td>
                <td className="actions">
                  {b.myLoan ? <span className="muted">You have it</span>
                    : <button className="btn sm" disabled={b.available < 1} onClick={() => act(b, "borrow")}>{b.available < 1 ? "Unavailable" : "Borrow"}</button>}
                </td></tr>
            ))}
            {shown?.length === 0 && <tr><td colSpan={5} className="muted">No books found.</td></tr>}
          </tbody>
        </table>
        <p className="muted">You can borrow up to 3 books for 14 days each.</p>
      </Card>
      {past?.length > 0 && (
        <Card title="Past loans">
          <table>
            <thead><tr><th>Title</th><th>Borrowed</th><th>Returned</th></tr></thead>
            <tbody>{past.map((l, i) => <tr key={i}><td>{l.title}</td><td>{fmtDate(l.borrowedAt)}</td><td>{fmtDate(l.returnedAt)}</td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </>
  );
}
