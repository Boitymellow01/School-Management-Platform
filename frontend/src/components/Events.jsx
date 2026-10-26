import { useState } from "react";
import { api } from "../api";
import { useFetch, today } from "../hooks";
import Card from "./Card";

const blank = { title: "", date: "", location: "", description: "" };
// Event dates are stored as UTC midnight, so show them in UTC to avoid off-by-one days.
const inUTC = (d, opts) => new Date(d).toLocaleDateString(undefined, { timeZone: "UTC", ...opts });

// Everyone can view; only admin (canPost) can add or delete.
export default function Events({ canPost }) {
  const { data, error, reload } = useFetch("/events");
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function post(e) {
    e.preventDefault(); setMsg("");
    try { await api.post("/events", form); setForm(blank); reload(); }
    catch (err) { setMsg(err.message); }
  }
  async function remove(id) {
    if (!confirm("Delete this event?")) return;
    try { await api.del(`/events/${id}`); reload(); } catch (err) { setMsg(err.message); }
  }

  // group by month, in date order (the API already sorts by date)
  const groups = [];
  (data || []).forEach((ev) => {
    const label = inUTC(ev.date, { month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(ev); else groups.push({ label, items: [ev] });
  });

  return (
    <>
      <h2>Events calendar</h2>
      {canPost && (
        <Card title="New event">
          <form className="form grid" onSubmit={post}>
            <label>Title<input value={form.title} onChange={set("title")} required /></label>
            <label>Date<input type="date" value={form.date} onChange={set("date")} required /></label>
            <label>Location<input value={form.location} onChange={set("location")} /></label>
            <label>Details<input value={form.description} onChange={set("description")} /></label>
            <div className="row"><button className="btn">Add event</button></div>
          </form>
        </Card>
      )}
      {(error || msg) && <p className="error">{error || msg}</p>}
      {data?.length === 0 && <p className="muted">No events yet.</p>}
      {groups.map((g) => (
        <Card key={g.label} title={g.label}>
          {g.items.map((ev) => {
            const past = ev.date.slice(0, 10) < today();
            return (
              <div className="event" key={ev._id} style={{ opacity: past ? 0.55 : 1 }}>
                <div className="date-badge">
                  <strong>{inUTC(ev.date, { day: "numeric" })}</strong>
                  <span>{inUTC(ev.date, { month: "short" })}</span>
                </div>
                <div className="event-body">
                  <strong>{ev.title}</strong>
                  <div className="muted">{[ev.location, ev.description].filter(Boolean).join(" · ") || "—"}</div>
                </div>
                {canPost && <button className="btn danger sm" onClick={() => remove(ev._id)}>Delete</button>}
              </div>
            );
          })}
        </Card>
      ))}
    </>
  );
}
