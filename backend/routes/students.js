const router = require("express").Router();
const User = require("../models/User");
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const Class = require("../models/Class");
const { wrap, myTeacher, normGrade } = require("../utils");

router.get("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  let filter = {};
  if (req.user.role === "teacher") {
    // A teacher sees students in classes they teach, plus any student in a grade they teach.
    const t = await myTeacher(req.user.id);
    const mine = t ? (await Class.find({ teacher: t._id }).select("_id")).map((c) => String(c._id)) : [];
    const grades = t?.grades || [];
    if (req.query.class) {
      if (!mine.includes(String(req.query.class))) return res.json([]);
      filter = { class: req.query.class };
    } else if (req.query.grade) {
      const g = normGrade(req.query.grade);
      if (!g || !grades.includes(g)) return res.json([]);
      filter = { grade: g };
    } else {
      filter = { $or: [{ class: { $in: mine } }, { grade: { $in: grades } }] };
    }
  } else if (req.query.class) filter = { class: req.query.class };
  else if (req.query.grade) filter = { grade: req.query.grade };
  res.json(await Student.find(filter).populate("user", "name email").populate("class", "name").sort("studentNumber"));
}));

// A teacher puts a student of a grade they teach into one of their own classes (or takes them out with class: "").
router.put("/:id/enroll", auth(["teacher"]), wrap(async (req, res) => {
  const t = await myTeacher(req.user.id);
  const student = await Student.findById(req.params.id);
  if (!t || !student) return res.status(404).json({ message: "Not found" });
  const myClassIds = (await Class.find({ teacher: t._id }).select("_id")).map((c) => String(c._id));
  const inMyClass = student.class && myClassIds.includes(String(student.class));
  if (!inMyClass && !(student.grade && (t.grades || []).includes(student.grade))) {
    return res.status(403).json({ message: "This student is not in a grade you teach" });
  }
  if (student.class && !inMyClass) return res.status(403).json({ message: "Student already belongs to another teacher's class" });
  const target = req.body?.class || null;
  if (target && !myClassIds.includes(String(target))) return res.status(403).json({ message: "Not your class" });
  student.class = target;
  await student.save();
  res.json(await student.populate([{ path: "user", select: "name email" }, { path: "class", select: "name" }]));
}));

router.post("/", auth(["admin"]), wrap(async (req, res) => {
  const { name, email, password, studentNumber, grade, class: cls } = req.body || {};
  if (!name || !email || !password || !studentNumber) return res.status(400).json({ message: "name, email, password, studentNumber required" });
  if (await Student.findOne({ studentNumber })) return res.status(409).json({ message: "Student number already exists" });
  const user = await User.create({ name, email, password, role: "student" }).catch((e) => {
    if (e.code === 11000) { res.status(409).json({ message: "Email already in use" }); return null; }
    throw e;
  });
  if (!user) return;
  const student = await Student.create({ user: user._id, studentNumber, grade, class: cls || null });
  res.status(201).json(await student.populate([{ path: "user", select: "name email" }, { path: "class", select: "name" }]));
}));

router.put("/:id", auth(["admin"]), wrap(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  const { name, email, password, studentNumber, grade, class: cls } = req.body || {};
  const user = await User.findById(student.user).select("+password");
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (studentNumber) student.studentNumber = studentNumber;
  if (grade !== undefined) student.grade = grade;
  if (cls !== undefined) student.class = cls || null;
  try { await user.save(); await student.save(); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Email or student number already in use" }); throw e; }
  res.json(await student.populate([{ path: "user", select: "name email" }, { path: "class", select: "name" }]));
}));

router.delete("/:id", auth(["admin"]), wrap(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  await User.findByIdAndDelete(student.user);
  res.json({ message: "Deleted" });
}));

module.exports = router;
