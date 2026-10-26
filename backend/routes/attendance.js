const router = require("express").Router();
const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const { wrap, myTeacher, myStudent } = require("../utils");

// Student's own history
router.get("/me", auth(["student"]), wrap(async (req, res) => {
  const s = await myStudent(req.user.id);
  if (!s) return res.json({ records: [], summary: { present: 0, absent: 0, late: 0, total: 0 } });
  const days = await Attendance.find({ "records.student": s._id }).sort("-date").lean();
  const records = days.map((d) => ({ date: d.date, status: d.records.find((r) => String(r.student) === String(s._id)).status }));
  const summary = { present: 0, absent: 0, late: 0, total: records.length };
  records.forEach((r) => summary[r.status]++);
  res.json({ records, summary });
}));

// Roll for a class on a date (admin/teacher). Returns every student with a status (default present).
router.get("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const { class: cls, date } = req.query;
  if (!cls || !date) return res.status(400).json({ message: "class and date required" });
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    if (!t || !(await Class.exists({ _id: cls, teacher: t._id }))) return res.status(403).json({ message: "Not your class" });
  }
  const students = await Student.find({ class: cls }).populate("user", "name").sort("studentNumber").lean();
  const day = await Attendance.findOne({ class: cls, date }).lean();
  const byId = Object.fromEntries((day?.records || []).map((r) => [String(r.student), r.status]));
  res.json({ saved: !!day, records: students.map((s) => ({ student: s._id, name: s.user?.name, studentNumber: s.studentNumber, status: byId[String(s._id)] || "present" })) });
}));

router.put("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const { class: cls, date, records } = req.body || {};
  if (!cls || !/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !Array.isArray(records)) return res.status(400).json({ message: "class, date (YYYY-MM-DD), records required" });
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    if (!t || !(await Class.exists({ _id: cls, teacher: t._id }))) return res.status(403).json({ message: "Not your class" });
  }
  const valid = new Set((await Student.find({ class: cls }).select("_id")).map((s) => String(s._id)));
  const clean = records.filter((r) => valid.has(String(r.student)) && ["present", "absent", "late"].includes(r.status))
    .map((r) => ({ student: r.student, status: r.status }));
  const doc = await Attendance.findOneAndUpdate({ class: cls, date }, { records: clean }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  res.json(doc);
}));

// Admin overview: attendance rate per class
router.get("/summary", auth(["admin"]), wrap(async (req, res) => {
  const classes = await Class.find().lean();
  const days = await Attendance.find().lean();
  res.json(classes.map((c) => {
    let present = 0, total = 0;
    days.filter((d) => String(d.class) === String(c._id)).forEach((d) => d.records.forEach((r) => { total++; if (r.status !== "absent") present++; }));
    return { class: c._id, name: c.name, total, rate: total ? Math.round((present / total) * 100) : null };
  }));
}));

module.exports = router;
