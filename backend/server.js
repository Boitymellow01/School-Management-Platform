require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

for (const k of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[k]) { console.error(`Missing ${k} in .env`); process.exit(1); }
}

const app = express();
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",") }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/events", require("./routes/events"));
app.use("/api/performance", require("./routes/performance"));
app.use("/api/library", require("./routes/library"));
app.use("/api/settings", require("./routes/settings"));

app.get("/", (req, res) => res.send("School Management API is running"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => { console.error("MongoDB connection error:", err.message); process.exit(1); });

module.exports = app;
