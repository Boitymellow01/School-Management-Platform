const router = require("express").Router();
const Setting = require("../models/Setting");
const auth = require("../middleware/auth");
const { wrap } = require("../utils");

const load = () => Setting.findOne().then((s) => s || Setting.create({}));

router.get("/", auth(), wrap(async (req, res) => res.json(await load())));

router.put("/", auth(["admin"]), wrap(async (req, res) => {
  const s = await load();
  const { schoolName, academicYear, term, contactEmail } = req.body || {};
  if (schoolName !== undefined && !String(schoolName).trim()) return res.status(400).json({ message: "School name can't be empty" });
  if (schoolName !== undefined) s.schoolName = schoolName;
  if (academicYear !== undefined) s.academicYear = academicYear;
  if (term !== undefined) s.term = term;
  if (contactEmail !== undefined) s.contactEmail = contactEmail;
  await s.save();
  res.json(s);
}));

module.exports = router;
