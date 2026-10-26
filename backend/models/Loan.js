const mongoose = require("mongoose");
module.exports = mongoose.model("Loan", new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    borrowedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
));
