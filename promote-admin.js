require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/user.model");

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run make-admin -- admin@example.com");

  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  if (!user) throw new Error("No user exists with that email");
  console.log(`${user.email} is now an administrator`);
  await mongoose.disconnect();
}

promoteAdmin().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
