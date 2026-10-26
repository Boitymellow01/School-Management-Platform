const mongoose = require("mongoose");
module.exports = mongoose.model("Book", new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    category: { type: String, trim: true },
    copies: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
));
