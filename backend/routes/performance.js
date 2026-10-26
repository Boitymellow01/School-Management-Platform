const router = require("express").Router();
const Exam = require("../models/Exam");
const Class = require("../models/Class");
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const { wrap, myTeacher, myStudent } = require("../utils");

const pct = (marks, total) => (total ? Math.round((marks / total) * 1000) / 10 : 0);
const mean = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);

// A student's own results, per exam and per subject.
router.get("/me", auth(["student"]), wrap(async (req, res) => {
  const s = await myStudent(req.user.id);
  if (!s || !s.class) return res.json({ overall: null, exams: [], subjects: [] });
  const exams = await Exam.find({ class: s.class }).sort("date").lean();
  const rows = [];
  for (const e of exams) {
    const mine = (e.results || []).find((r) => String(r.student) === String(s._id));
    if (!mine) continue;
    rows.push({
      _id: e._id, title: e.title, subject: e.subject || "General", date: e.date,
      marks: mine.marks, totalMarks: e.totalMarks, percent: pct(mine.marks, e.totalMarks),
      classAverage: mean((e.results || []).map((r) => pct(r.marks, e.totalMarks))),
    });
  }
  const bySubject = {};
  rows.forEach((r) => (bySubject[r.subject] = bySubject[r.subject] || []).push(r.percent));
  const subjects = Object.entries(bySubject).map(([subject, p]) => ({ subject, average: mean(p), exams: p.length }));
  res.json({ overall: mean(rows.map((r) => r.percent)), exams: rows, subjects });
}));

// A class overview for the teacher of that class (or admin).
router.get("/class/:id", auth(["admin", "teacher"]), wrap(async (req, res) => {
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    if (!t || !(await Class.exists({ _id: req.params.id, teacher: t._id }))) return res.status(403).json({ message: "Not your class" });
  } else if (!(await Class.exists({ _id: req.params.id }))) {
    return res.status(404).json({ message: "Class not found" });
  }
  const students = await Student.find({ class: req.params.id }).populate("user", "name").sort("studentNumber").lean();
  const exams = await Exam.find({ class: req.params.id }).sort("date").lean();

  const perStudent = students.map((st) => {
    const percents = [];
    exams.forEach((e) => {
      const r = (e.results || []).find((x) => String(x.student) === String(st._id));
      if (r) percents.push(pct(r.marks, e.totalMarks));
    });
    return { _id: st._id, name: st.user?.name, studentNumber: st.studentNumber, examsTaken: percents.length, average: mean(percents) };
  });
  const perExam = exams.map((e) => ({
    _id: e._id, title: e.title, subject: e.subject || "General", date: e.date,
    entered: (e.results || []).length, average: mean((e.results || []).map((r) => pct(r.marks, e.totalMarks))),
  }));
  res.json({ students: perStudent, exams: perExam, classAverage: mean(perStudent.map((s) => s.average).filter((a) => a !== null)) });
}));

module.exports = router;
