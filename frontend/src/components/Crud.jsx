import { useState } from "react";
import { api } from "../api";
import Card from "./Card";

// fields: [{key, label, type?, options?: [{value,label}], required?, hideOnEdit?}]
// columns: [{label, render(row)}]
export default function Crud({ title, endpoint, rows, reload, fields, columns, toForm }) {
  const empty = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault(); setMsg("");
    const body = { ...form };
    if (editing && !body.password) delete body.password;
    try {
      if (editing) await api.put(`${endpoint}/${editing}`, body);
      else await api.post(endpoint, body);
      setForm(empty); setEditing(null); reload();
    } catch (err) { setMsg(err.message); }
  }
  function edit(row) { setEditing(row._id); setForm({ ...empty, ...toForm(row) }); window.scrollTo(0, 0); }
  async function remove(row) {
    if (!confirm("Delete this record?")) return;
    try { await api.del(`${endpoint}/${row._id}`); reload(); } catch (err) { setMsg(err.message); }
  }

  return (
    <>
      <h2>{title}</h2>
      <Card title={editing ? "Edit" : "Add new"}>
        <form className="form grid" onSubmit={submit}>
          {fields.map((f) => (
            <label key={f.key}>{f.label}
              {f.options ? (
                <select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                  <option value="">— none —</option>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type || "text"} value={form[f.key]} placeholder={f.key === "password" && editing ? "leave blank to keep" : ""}
                  required={f.required && !(editing && f.key === "password")}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
          <div className="row">
            <button className="btn">{editing ? "Save" : "Add"}</button>
            {editing && <button type="button" className="btn secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
        {msg && <p className="error">{msg}</p>}
      </Card>
      <Card>
        <table>
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r._id}>
                {columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                <td className="actions"><button className="btn secondary sm" onClick={() => edit(r)}>Edit</button> <button className="btn danger sm" onClick={() => remove(r)}>Delete</button></td>
              </tr>
            ))}
            {rows?.length === 0 && <tr><td colSpan={columns.length + 1} className="muted">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
