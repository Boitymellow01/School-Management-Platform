import { useState } from "react";
import { api } from "../api";
import { useFetch, fmtDate } from "../hooks";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";

// Shared by all roles. Admin/teacher can post; admin can delete any, teacher own.
export default function Announcements({ canPost }) {
  const { user } = useAuth();
  const { data, error, reload } = useFetch("/announcements");
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });
  const [msg, setMsg] = useState("");

  async function post(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/announcements", form); setForm({ title: "", body: "", audience: "all" }); reload(); }
    catch (err) { setMsg(err.message); }
  }
  async function remove(id) {
    if (!confirm("Delete this announcement?")) return;
    try { await api.del(`/announcements/${id}`); reload(); } catch (err) { setMsg(err.message); }
  }

  return (
    <>
      <h2>Announcements</h2>
      {canPost && (
        <Card title="New announcement">
          <form className="form" onSubmit={post}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Message" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            {user.role === "admin" && (
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone</option><option value="teachers">Teachers</option><option value="students">Students</option>
              </select>
            )}
            <button className="btn">Post</button>
          </form>
        </Card>
      )}
      {(error || msg) && <p className="error">{error || msg}</p>}
      {data?.length === 0 && <p className="muted">No announcements yet.</p>}
      {data?.map((a) => (
        <Card key={a._id} title={a.title} action={
          canPost && (user.role === "admin" || a.author?._id === user.id) && <button className="btn danger sm" onClick={() => remove(a._id)}>Delete</button>
        }>
          <p>{a.body}</p>
          <p className="muted">{a.author?.name} · {fmtDate(a.createdAt)} · for {a.audience}</p>
        </Card>
      ))}
    </>
  );
}
