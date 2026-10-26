const mongoose = require("mongoose");
module.exports = mongoose.model("Exam", new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    totalMarks: { type: Number, default: 100, min: 1 },
    results: [
      {
        _id: false,
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        marks: { type: Number, min: 0, required: true },
      },
    ],
  },
  { timestamps: true }
));
