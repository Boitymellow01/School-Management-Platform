const mongoose = require("mongoose");
module.exports = mongoose.model("Teacher", new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    subject: { type: String, trim: true },
    phone: { type: String, trim: true },
    grades: { type: [String], default: [] },
  },
  { timestamps: true }
));
