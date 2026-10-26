const router = require("express").Router();
const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const { wrap } = require("../utils");

router.get("/", auth(), wrap(async (req, res) => {
  const role = req.user.role;
  const filter = role === "admin" ? {} : { audience: { $in: ["all", role === "teacher" ? "teachers" : "students"] } };
  res.json(await Announcement.find(filter).populate("author", "name role").sort("-createdAt"));
}));

router.post("/", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const { title, body, audience } = req.body || {};
  if (!title || !body) return res.status(400).json({ message: "title and body required" });
  // teachers can only address students
  const aud = req.user.role === "teacher" ? "students" : audience || "all";
  res.status(201).json(await Announcement.create({ title, body, audience: aud, author: req.user.id }));
}));

router.delete("/:id", auth(["admin", "teacher"]), wrap(async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  if (req.user.role !== "admin" && String(a.author) !== String(req.user.id)) return res.status(403).json({ message: "Not yours" });
  await a.deleteOne();
  res.json({ message: "Deleted" });
}));

module.exports = router;
