const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { wrap, myTeacher, myStudent, normGrade, parseGrades } = require("../utils");

const sign = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post("/login", wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));

// Self-registration. Only student and teacher accounts - admins are never created here.
router.post("/register", wrap(async (req, res) => {
  const b = req.body || {};
  if (!["student", "teacher"].includes(b.role)) {
    return res.status(403).json({ message: "Only student or teacher accounts can register here" });
  }
  const name = String(b.name || "").trim();
  const email = String(b.email || "").toLowerCase().trim();
  const password = String(b.password || "");
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  const studentNumber = String(b.studentNumber || "").trim();
  if (b.role === "student" && !studentNumber) return res.status(400).json({ message: "Student number is required" });
  let grade = null, grades = [];
  if (b.role === "student") {
    grade = normGrade(b.grade);
    if (!grade) return res.status(400).json({ message: "Please choose your grade" });
  } else {
    grades = parseGrades(b.grades);
    if (!grades || !grades.length) return res.status(400).json({ message: "Please choose at least one grade you teach" });
  }

  if (await User.exists({ email })) return res.status(409).json({ message: "Email already in use" });
  if (b.role === "student" && (await Student.exists({ studentNumber }))) {
    return res.status(409).json({ message: "Student number already registered" });
  }

  const user = await User.create({ name, email, password, role: b.role });
  try {
    if (b.role === "student") await Student.create({ user: user._id, studentNumber, grade });
    else await Teacher.create({ user: user._id, subject: String(b.subject || "").trim(), phone: String(b.phone || "").trim(), grades });
  } catch (e) {
    await User.findByIdAndDelete(user._id); // don't leave a half-made account behind
    throw e;
  }
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

router.get("/profile", auth(), wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User no longer exists" });
  const out = publicUser(user);
  if (user.role === "teacher") {
    const t = await myTeacher(user._id);
    Object.assign(out, { subject: t?.subject || "", phone: t?.phone || "", grades: t?.grades || [] });
  } else if (user.role === "student") {
    const s = await myStudent(user._id).populate("class", "name");
    Object.assign(out, { studentNumber: s?.studentNumber || "", grade: s?.grade || "", className: s?.class?.name || "" });
  }
  res.json(out);
}));

router.put("/profile", auth(), wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User no longer exists" });
  const b = req.body || {};
  let newGrade, newGrades;
  if (user.role === "student" && b.grade !== undefined) {
    newGrade = normGrade(b.grade);
    if (!newGrade) return res.status(400).json({ message: "Please choose a valid grade" });
  }
  if (user.role === "teacher" && b.grades !== undefined) {
    newGrades = parseGrades(b.grades);
    if (!newGrades || !newGrades.length) return res.status(400).json({ message: "Choose at least one valid grade you teach" });
  }
  if (b.name !== undefined) {
    if (!String(b.name).trim()) return res.status(400).json({ message: "Name cannot be empty" });
    user.name = String(b.name).trim();
  }
  if (b.email !== undefined) {
    if (!String(b.email).trim()) return res.status(400).json({ message: "Email cannot be empty" });
    user.email = String(b.email).toLowerCase().trim();
    if (await User.exists({ email: user.email, _id: { $ne: user._id } })) {
      return res.status(409).json({ message: "Email already in use" });
    }
  }
  try { await user.save(); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Email already in use" }); throw e; }
  if (user.role === "teacher") {
    const update = {};
    if (b.subject !== undefined) update.subject = String(b.subject).trim();
    if (b.phone !== undefined) update.phone = String(b.phone).trim();
    if (newGrades) update.grades = newGrades;
    if (Object.keys(update).length) await Teacher.updateOne({ user: user._id }, update);
  } else if (user.role === "student" && newGrade) {
    await Student.updateOne({ user: user._id }, { grade: newGrade });
  }
  res.json(publicUser(user));
}));

router.get("/me", auth(), wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User no longer exists" });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
}));

router.put("/password", auth(), wrap(async (req, res) => {
  const { current, next } = req.body || {};
  if (!next || next.length < 6) return res.status(400).json({ message: "New password must be 6+ characters" });
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.checkPassword(current || ""))) return res.status(400).json({ message: "Current password is wrong" });
  user.password = next;
  await user.save();
  res.json({ message: "Password updated" });
}));

module.exports = router;
