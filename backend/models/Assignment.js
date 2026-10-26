const mongoose = require("mongoose");
module.exports = mongoose.model("Assignment", new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
));
