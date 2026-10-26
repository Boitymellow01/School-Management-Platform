const mongoose = require("mongoose");
module.exports = mongoose.model("Class", new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    grade: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  },
  { timestamps: true }
));
