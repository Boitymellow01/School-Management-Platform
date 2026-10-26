const router = require("express").Router();
const Exam = require("../models/Exam");
const Class = require("../models/Class");
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const { wrap, myTeacher, myStudent } = require("../utils");

async function teacherOwnsClass(userId, classId) {
  const t = await myTeacher(userId);
  return !!t && !!(await Class.exists({ _id: classId, teacher: t._id }));
}

router.get("/", auth(), wrap(async (req, res) => {
  let filter = {};
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    const ids = t ? (await Class.find({ teacher: t._id }).select("_id")).map((c) => c._id) : [];
    filter = { class: { $in: ids } };
  } else if (req.user.role === "student") {
    const s = await myStudent(req.user.id);
    const exams = await Exam.find({ class: s ? s.class : null }).populate("class", "name").sort("-date").lean();
    // students only see their own mark
    return res.json(exams.map((e) => {
      const mine = (e.results || []).find((r) => String(r.student) === String(s._id));
      const { results, ...rest } = e;
      return { ...rest, marks: mine ? mine.marks : null };
    }));
  }
  res.json(await Exam.find(filter).populate("class", "name").sort("-date"));
}));

router.post("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const { title, subject, class: cls, date, totalMarks } = req.body || {};
  if (!title || !cls || !date) return res.status(400).json({ message: "title, class, date required" });
  if (req.user.role === "teacher" && !(await teacherOwnsClass(req.user.id, cls))) {
    return res.status(403).json({ message: "Not your class" });
  }
  res.status(201).json(await Exam.create({ title, subject, class: cls, date, totalMarks }));
}));

// Marks for one exam: [{ student, marks }]
router.put("/:id/marks", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Not found" });
  if (req.user.role === "teacher" && !(await teacherOwnsClass(req.user.id, exam.class))) {
    return res.status(403).json({ message: "Not your class" });
  }
  const results = Array.isArray(req.body.results) ? req.body.results : [];
  const valid = new Set((await Student.find({ class: exam.class }).select("_id")).map((s) => String(s._id)));
  const clean = [];
  for (const r of results) {
    if (!valid.has(String(r.student))) return res.status(400).json({ message: "Student not in this class" });
    const marks = Number(r.marks);
    if (Number.isNaN(marks) || marks < 0 || marks > exam.totalMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${exam.totalMarks}` });
    }
    clean.push({ student: r.student, marks });
  }
  exam.results = clean;
  await exam.save();
  res.json(exam);
}));

router.delete("/:id", auth(["admin"]), wrap(async (req, res) => {
  const e = await Exam.findByIdAndDelete(req.params.id);
  if (!e) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
}));

module.exports = router;
