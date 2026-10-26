const mongoose = require("mongoose");
module.exports = mongoose.model("Announcement", new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    audience: { type: String, enum: ["all", "teachers", "students"], default: "all" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
));
