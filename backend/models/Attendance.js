const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    records: [
      {
        _id: false,
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        status: { type: String, enum: ["present", "absent", "late"], default: "present" },
      },
    ],
  },
  { timestamps: true }
);
schema.index({ class: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("Attendance", schema);
