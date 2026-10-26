const router = require("express").Router();
const Class = require("../models/Class");
const Student = require("../models/Student");
const auth = require("../middleware/auth");
const { wrap, myTeacher, myStudent } = require("../utils");

const populate = (q) => q.populate({ path: "teacher", populate: { path: "user", select: "name" } });

// Admin: all. Teacher: classes they teach. Student: their own class.
router.get("/", auth(), wrap(async (req, res) => {
  let filter = {};
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    filter = { teacher: t ? t._id : null };
  } else if (req.user.role === "student") {
    const s = await myStudent(req.user.id);
    filter = { _id: s ? s.class : null };
  }
  const classes = await populate(Class.find(filter).sort("name")).lean();
  const counts = await Student.aggregate([{ $group: { _id: "$class", n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(classes.map((c) => ({ ...c, studentCount: map[String(c._id)] || 0 })));
}));

router.post("/", auth(["admin"]), wrap(async (req, res) => {
  const { name, grade, teacher } = req.body || {};
  if (!name) return res.status(400).json({ message: "name required" });
  try { const c = await Class.create({ name, grade, teacher: teacher || null }); res.status(201).json(c); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Class name already exists" }); throw e; }
}));

router.put("/:id", auth(["admin"]), wrap(async (req, res) => {
  const { name, grade, teacher } = req.body || {};
  const update = {};
  if (name) update.name = name;
  if (grade !== undefined) update.grade = grade;
  if (teacher !== undefined) update.teacher = teacher || null;
  const c = await Class.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: "Not found" });
  res.json(c);
}));

router.delete("/:id", auth(["admin"]), wrap(async (req, res) => {
  const c = await Class.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  await Student.updateMany({ class: c._id }, { class: null });
  res.json({ message: "Deleted" });
}));

module.exports = router;
