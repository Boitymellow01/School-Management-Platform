import { GRADES } from "../grades";

// Tick-box grid for choosing the grades a teacher teaches.
export default function GradePicker({ value, onChange }) {
  const toggle = (g) => onChange(value.includes(g) ? value.filter((x) => x !== g) : [...value, g]);
  return (
    <div className="grade-grid">
      {GRADES.map((g) => (
        <label key={g} className="radio">
          <input type="checkbox" checked={value.includes(g)} onChange={() => toggle(g)} /> {g.replace("Grade ", "")}
        </label>
      ))}
    </div>
  );
}
