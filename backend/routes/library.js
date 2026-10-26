const router = require("express").Router();
const Book = require("../models/Book");
const Loan = require("../models/Loan");
const auth = require("../middleware/auth");
const { wrap } = require("../utils");

const LOAN_DAYS = 14;
const MAX_LOANS = 3;

// Everyone logged in can browse. Each book shows how many copies are free and whether I hold one.
router.get("/books", auth(), wrap(async (req, res) => {
  const books = await Book.find().sort("title").lean();
  const active = await Loan.find({ returnedAt: null }).select("book borrower").lean();
  const out = books.map((b) => {
    const loans = active.filter((l) => String(l.book) === String(b._id));
    return { ...b, available: Math.max(0, b.copies - loans.length), borrowedByMe: loans.some((l) => String(l.borrower) === String(req.user.id)) };
  });
  res.json(out);
}));

router.post("/books", auth(["admin"]), wrap(async (req, res) => {
  const { title, author, category, copies } = req.body || {};
  if (!title) return res.status(400).json({ message: "title required" });
  const n = copies === "" || copies === undefined ? 1 : Number(copies);
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ message: "copies must be a whole number, 0 or more" });
  res.status(201).json(await Book.create({ title, author, category, copies: n }));
}));

router.put("/books/:id", auth(["admin"]), wrap(async (req, res) => {
  const { title, author, category, copies } = req.body || {};
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Not found" });
  if (title) book.title = title;
  if (author !== undefined) book.author = author;
  if (category !== undefined) book.category = category;
  if (copies !== undefined && copies !== "") {
    const n = Number(copies);
    if (!Number.isInteger(n) || n < 0) return res.status(400).json({ message: "copies must be a whole number, 0 or more" });
    const out = await Loan.countDocuments({ book: book._id, returnedAt: null });
    if (n < out) return res.status(400).json({ message: `${out} copies are currently borrowed - cannot set copies below that` });
    book.copies = n;
  }
  await book.save();
  res.json(book);
}));

router.delete("/books/:id", auth(["admin"]), wrap(async (req, res) => {
  if (await Loan.exists({ book: req.params.id, returnedAt: null })) {
    return res.status(409).json({ message: "This book is currently borrowed - wait for it to be returned" });
  }
  const b = await Book.findByIdAndDelete(req.params.id);
  if (!b) return res.status(404).json({ message: "Not found" });
  await Loan.deleteMany({ book: b._id });
  res.json({ message: "Deleted" });
}));

router.post("/books/:id/borrow", auth(["student"]), wrap(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Not found" });
  const mine = await Loan.find({ borrower: req.user.id, returnedAt: null }).lean();
  if (mine.some((l) => String(l.book) === String(book._id))) return res.status(409).json({ message: "You already have this book" });
  if (mine.length >= MAX_LOANS) return res.status(409).json({ message: `You can borrow at most ${MAX_LOANS} books at a time` });
  const out = await Loan.countDocuments({ book: book._id, returnedAt: null });
  if (out >= book.copies) return res.status(409).json({ message: "No copies available right now" });
  const dueDate = new Date(Date.now() + LOAN_DAYS * 86400000);
  res.status(201).json(await Loan.create({ book: book._id, borrower: req.user.id, dueDate }));
}));

// My loans (students): current and past.
router.get("/loans/me", auth(["student"]), wrap(async (req, res) => {
  res.json(await Loan.find({ borrower: req.user.id }).populate("book", "title author").sort("-borrowedAt"));
}));

// All loans (admin); ?active=1 for only those not yet returned.
router.get("/loans", auth(["admin"]), wrap(async (req, res) => {
  const filter = req.query.active ? { returnedAt: null } : {};
  res.json(await Loan.find(filter).populate("book", "title").populate("borrower", "name email").sort("-borrowedAt").limit(200));
}));

// Return a book: the borrower themself or an admin.
router.post("/loans/:id/return", auth(["student", "admin"]), wrap(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: "Not found" });
  if (req.user.role !== "admin" && String(loan.borrower) !== String(req.user.id)) return res.status(403).json({ message: "Not yours" });
  if (loan.returnedAt) return res.status(409).json({ message: "Already returned" });
  loan.returnedAt = new Date();
  await loan.save();
  res.json(loan);
}));

module.exports = router;
