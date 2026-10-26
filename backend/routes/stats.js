const router = require("express").Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Exam = require("../models/Exam");
const auth = require("../middleware/auth");
const { wrap } = require("../utils");

router.get("/", auth(["admin"]), wrap(async (req, res) => {
  const [students, teachers, classes, exams] = await Promise.all([
    Student.countDocuments(), Teacher.countDocuments(), Class.countDocuments(), Exam.countDocuments(),
  ]);
  res.json({ students, teachers, classes, exams });
}));

module.exports = router;
