const router = require("express").Router();
const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const { wrap, myTeacher, myStudent } = require("../utils");

const populate = (q) => q.populate("class", "name").populate("createdBy", "name");

// Admin: all. Teacher: their classes. Student: their class.
router.get("/", auth(), wrap(async (req, res) => {
  let filter = {};
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    const ids = t ? (await Class.find({ teacher: t._id }).select("_id")).map((c) => c._id) : [];
    filter = { class: { $in: ids } };
  } else if (req.user.role === "student") {
    const s = await myStudent(req.user.id);
    filter = { class: s && s.class ? s.class : null };
  }
  res.json(await populate(Assignment.find(filter)).sort("dueDate"));
}));

router.post("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const { title, description, subject, class: cls, dueDate } = req.body || {};
  if (!title || !cls || !dueDate) return res.status(400).json({ message: "title, class and due date required" });
  if (Number.isNaN(new Date(dueDate).getTime())) return res.status(400).json({ message: "Invalid due date" });
  if (req.user.role === "teacher") {
    const t = await myTeacher(req.user.id);
    if (!t || !(await Class.exists({ _id: cls, teacher: t._id }))) return res.status(403).json({ message: "Not your class" });
  } else if (!(await Class.exists({ _id: cls }))) {
    return res.status(400).json({ message: "Class not found" });
  }
  const a = await Assignment.create({ title, description, subject, class: cls, dueDate, createdBy: req.user.id });
  res.status(201).json(await populate(Assignment.findById(a._id)));
}));

router.delete("/:id", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const a = await Assignment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  if (req.user.role !== "admin" && String(a.createdBy) !== String(req.user.id)) return res.status(403).json({ message: "Not yours" });
  await a.deleteOne();
  res.json({ message: "Deleted" });
}));

module.exports = router;
