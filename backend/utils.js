const Teacher = require("./models/Teacher");
const Student = require("./models/Student");

// Wrap async handlers so errors reach the Express error handler.
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.myTeacher = (userId) => Teacher.findOne({ user: userId });
exports.myStudent = (userId) => Student.findOne({ user: userId });

// Grades offered in the registration dropdowns. Teachers and students are matched on these exact values.
const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
exports.GRADES = GRADES;
// "grade 10" / "Grade 10" -> "Grade 10"; anything not in the list -> null
exports.normGrade = (v) => GRADES.find((g) => g.toLowerCase() === String(v ?? "").trim().toLowerCase()) || null;
// array or comma-separated string -> unique valid grades; returns null if any entry is invalid
exports.parseGrades = (v) => {
  const items = Array.isArray(v) ? v : String(v ?? "").split(",");
  const out = [];
  for (const raw of items) {
    if (!String(raw).trim()) continue;
    const g = exports.normGrade(raw);
    if (!g) return null;
    if (!out.includes(g)) out.push(g);
  }
  return out;
};
