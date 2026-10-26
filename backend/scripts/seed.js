// Creates a first admin so you can log in:  npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL || "admin@school.test";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  if (await User.findOne({ email })) console.log("Admin already exists:", email);
  else { await User.create({ name: "Administrator", email, password, role: "admin" }); console.log(`Admin created: ${email} / ${password}  (change it after login)`); }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
