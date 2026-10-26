const router = require("express").Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const { wrap } = require("../utils");

// Everyone can see events; only admin manages them.
router.get("/", auth(), wrap(async (req, res) => {
  res.json(await Event.find().sort("date"));
}));

router.post("/", auth(["admin"]), wrap(async (req, res) => {
  const { title, description, location, date } = req.body || {};
  if (!title || !date) return res.status(400).json({ message: "title and date required" });
  if (Number.isNaN(new Date(date).getTime())) return res.status(400).json({ message: "Invalid date" });
  res.status(201).json(await Event.create({ title, description, location, date, createdBy: req.user.id }));
}));

router.delete("/:id", auth(["admin"]), wrap(async (req, res) => {
  const e = await Event.findByIdAndDelete(req.params.id);
  if (!e) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
}));

module.exports = router;
