import { useState } from "react";
import { api } from "../../api";
import { useFetch, fmtDate } from "../../hooks";
import Crud from "../../components/Crud";
import Card from "../../components/Card";

export default function ManageLibrary() {
  const { data: books, reload, error } = useFetch("/library/books");
  const { data: loans, reload: reloadLoans } = useFetch("/library/loans?active=1");
  const [msg, setMsg] = useState("");

  async function giveBack(id) {
    setMsg("");
    try { await api.post(`/library/loans/${id}/return`); reload(); reloadLoans(); }
    catch (e) { setMsg(e.message); }
  }
  const overdue = (d) => new Date(d) < new Date();

  return (
    <>
      {error && <p className="error">{error}</p>}
      <Crud title="Library" endpoint="/library/books" rows={books} reload={() => { reload(); reloadLoans(); }}
        fields={[
          { key: "title", label: "Title", required: true }, { key: "author", label: "Author" },
          { key: "category", label: "Category" }, { key: "copies", label: "Copies", type: "number" },
        ]}
        columns={[
          { label: "Title", render: (r) => r.title }, { label: "Author", render: (r) => r.author },
          { label: "Category", render: (r) => r.category }, { label: "Copies", render: (r) => r.copies },
          { label: "Available", render: (r) => r.available },
        ]}
        toForm={(r) => ({ title: r.title, author: r.author || "", category: r.category || "", copies: r.copies })}
      />
      <Card title="Books currently borrowed">
        {msg && <p className="error">{msg}</p>}
        <table><thead><tr><th>Book</th><th>Borrower</th><th>Borrowed</th><th>Due</th><th /></tr></thead><tbody>
          {loans?.map((l) => (
            <tr key={l._id}>
              <td>{l.book?.title}</td><td>{l.borrower?.name}</td><td>{fmtDate(l.borrowedAt)}</td>
              <td>{fmtDate(l.dueDate)} {overdue(l.dueDate) && <span className="pill absent">overdue</span>}</td>
              <td className="actions"><button className="btn secondary sm" onClick={() => giveBack(l._id)}>Mark returned</button></td>
            </tr>
          ))}
          {loans?.length === 0 && <tr><td colSpan={5} className="muted">Nothing is out right now.</td></tr>}
        </tbody></table>
      </Card>
    </>
  );
}
