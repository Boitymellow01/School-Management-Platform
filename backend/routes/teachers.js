const router = require("express").Router();
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const { wrap, parseGrades } = require("../utils");

router.get("/", auth(["admin"]), wrap(async (req, res) => {
  res.json(await Teacher.find().populate("user", "name email"));
}));

// Colleague directory: teachers and admin can see names, subjects and emails (no phone numbers).
router.get("/directory", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const list = await Teacher.find().populate("user", "name email").lean();
  res.json(list.map((t) => ({ _id: t._id, name: t.user?.name, email: t.user?.email, subject: t.subject, grades: t.grades || [] })).sort((a, b) => String(a.name).localeCompare(String(b.name))));
}));

router.post("/", auth(["admin"]), wrap(async (req, res) => {
  const { name, email, password, subject, phone } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });
  const grades = parseGrades(req.body.grades);
  if (!grades) return res.status(400).json({ message: "Grades must be like: Grade 9, Grade 10" });
  const user = await User.create({ name, email, password, role: "teacher" }).catch((e) => {
    if (e.code === 11000) { res.status(409).json({ message: "Email already in use" }); return null; }
    throw e;
  });
  if (!user) return;
  const teacher = await Teacher.create({ user: user._id, subject, phone, grades });
  res.status(201).json(await teacher.populate("user", "name email"));
}));

router.put("/:id", auth(["admin"]), wrap(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Not found" });
  const { name, email, password, subject, phone } = req.body || {};
  if (req.body.grades !== undefined) {
    const grades = parseGrades(req.body.grades);
    if (!grades) return res.status(400).json({ message: "Grades must be like: Grade 9, Grade 10" });
    teacher.grades = grades;
  }
  const user = await User.findById(teacher.user).select("+password");
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (subject !== undefined) teacher.subject = subject;
  if (phone !== undefined) teacher.phone = phone;
  try { await user.save(); await teacher.save(); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Email already in use" }); throw e; }
  res.json(await teacher.populate("user", "name email"));
}));

router.delete("/:id", auth(["admin"]), wrap(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Not found" });
  await User.findByIdAndDelete(teacher.user);
  await Class.updateMany({ teacher: teacher._id }, { teacher: null });
  res.json({ message: "Deleted" });
}));

module.exports = router;
