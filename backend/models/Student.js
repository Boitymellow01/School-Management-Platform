const mongoose = require("mongoose");
module.exports = mongoose.model("Student", new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studentNumber: { type: String, required: true, unique: true, trim: true },
    grade: { type: String, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
  },
  { timestamps: true }
));
