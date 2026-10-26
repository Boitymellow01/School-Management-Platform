import { useEffect, useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import Card from "../../components/Card";

// School-wide settings. The school name shows in the header for every user.
export default function SettingsProfile() {
  const { data, error } = useFetch("/settings");
  const [f, setF] = useState({ schoolName: "", academicYear: "", term: "", contactEmail: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => { if (data) setF({ schoolName: data.schoolName, academicYear: data.academicYear, term: data.term, contactEmail: data.contactEmail }); }, [data]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setMsg("");
    try { await api.put("/settings", f); setMsg("Saved ✓"); window.dispatchEvent(new Event("settings-updated")); }
    catch (err) { setMsg(err.message); }
  }
  return (
    <>
      <h2>School settings</h2>
      {error && <p className="error">{error}</p>}
      <Card title="School profile">
        <form className="form grid" onSubmit={save}>
          <label>School name<input value={f.schoolName} onChange={set("schoolName")} required /></label>
          <label>Academic year<input placeholder="e.g. 2026" value={f.academicYear} onChange={set("academicYear")} /></label>
          <label>Current term<input placeholder="e.g. Term 4" value={f.term} onChange={set("term")} /></label>
          <label>Contact email<input type="email" value={f.contactEmail} onChange={set("contactEmail")} /></label>
          <div className="row"><button className="btn">Save settings</button></div>
        </form>
        {msg && <p className={msg.includes("✓") ? "ok" : "error"}>{msg}</p>}
      </Card>
    </>
  );
}
