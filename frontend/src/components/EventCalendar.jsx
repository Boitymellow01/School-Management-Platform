import { useState } from "react";
import { api } from "../api";
import { useFetch } from "../hooks";
import Card from "./Card";

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const blank = { title: "", description: "", date: "", endDate: "", audience: "all" };

// Month calendar of school events. Admin can add/delete (canEdit); others just view.
export default function EventCalendar({ canEdit }) {
  const { data, error, reload } = useFetch("/events");
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState("");

  const events = data || [];
  const on = (k) => events.filter((e) => e.date <= k && k <= (e.endDate || e.date));
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday first
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());
  const monthKey = `${view.y}-${pad(view.m + 1)}`;
  const inMonth = events.filter((e) => e.date.slice(0, 7) <= monthKey && monthKey <= (e.endDate || e.date).slice(0, 7));
  const shown = picked ? on(picked) : inMonth;

  function shift(n) {
    const d = new Date(view.y, view.m + n, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() }); setPicked(null);
  }
  async function add(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/events", form); setForm(blank); reload(); }
    catch (err) { setMsg(err.message); }
  }
  async function remove(id) {
    if (!confirm("Delete this event?")) return;
    try { await api.del(`/events/${id}`); reload(); } catch (err) { setMsg(err.message); }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h2>Event calendar</h2>
      {error && <p className="error">{error}</p>}
      {canEdit && (
        <Card title="Add event">
          <form className="form grid" onSubmit={add}>
            <label>Title<input value={form.title} onChange={set("title")} required /></label>
            <label>Starts<input type="date" value={form.date || picked || ""} onChange={set("date")} required /></label>
            <label>Ends (optional)<input type="date" value={form.endDate} min={form.date || picked || ""} onChange={set("endDate")} /></label>
            <label>For
              <select value={form.audience} onChange={set("audience")}>
                <option value="all">Everyone</option><option value="teachers">Teachers</option><option value="students">Students</option>
              </select>
            </label>
            <label>Details<input value={form.description} onChange={set("description")} /></label>
            <div className="row"><button className="btn">Add event</button></div>
          </form>
          {msg && <p className="error">{msg}</p>}
        </Card>
      )}
      <Card>
        <div className="cal-head">
          <button className="btn secondary sm" onClick={() => shift(-1)} aria-label="Previous month">‹ Prev</button>
          <h3>{new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
          <button className="btn secondary sm" onClick={() => shift(1)} aria-label="Next month">Next ›</button>
        </div>
        <div className="cal">
          {WEEK.map((d) => <div key={d} className="cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={`b${i}`} className="cal-day empty" />;
            const k = keyOf(view.y, view.m, d);
            const evs = on(k);
            return (
              <button key={k} type="button" className={`cal-day${k === todayKey ? " today" : ""}${k === picked ? " picked" : ""}`}
                onClick={() => setPicked(k === picked ? null : k)}>
                <span>{d}</span>
                {evs.slice(0, 2).map((e) => <span key={e._id} className="cal-ev">{e.title}</span>)}
                {evs.length > 2 && <span className="muted">+{evs.length - 2} more</span>}
              </button>
            );
          })}
        </div>
      </Card>
      <Card title={picked ? `Events on ${picked}` : "Events this month"}>
        {shown.length === 0 && <p className="muted">Nothing scheduled.</p>}
        {shown.map((e) => (
          <div key={e._id} className="card-head">
            <div>
              <strong>{e.title}</strong>
              <div className="muted">{e.date}{e.endDate ? ` → ${e.endDate}` : ""} · for {e.audience}{e.description ? ` · ${e.description}` : ""}</div>
            </div>
            {canEdit && <button className="btn danger sm" onClick={() => remove(e._id)}>Delete</button>}
          </div>
        ))}
      </Card>
    </>
  );
}
