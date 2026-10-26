const mongoose = require("mongoose");
// One document holds the school-wide settings.
module.exports = mongoose.model("Setting", new mongoose.Schema(
  {
    schoolName: { type: String, default: "School Management Platform", trim: true },
    academicYear: { type: String, default: "", trim: true },
    term: { type: String, default: "", trim: true },
    contactEmail: { type: String, default: "", trim: true },
  },
  { timestamps: true }
));
