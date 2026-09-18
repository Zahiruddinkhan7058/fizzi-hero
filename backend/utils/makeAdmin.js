const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");

async function makeAdmin(targetEmail, targetPassword = "AdminPassword123!", targetMobile) {
  if (!targetEmail) {
    console.error("Usage: node utils/makeAdmin.js <email> [password] [mobile]");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = targetEmail.toLowerCase().trim();
  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    if (targetPassword) {
      user.password = targetPassword; // pre-save will hash
    }
    await user.save();
    console.log(`✅ Existing user '${email}' has been promoted to ADMIN.`);
  } else {
    const mobile = targetMobile || `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    user = await User.create({
      name: "Fizzi Admin",
      email,
      mobile,
      password: targetPassword,
      role: "admin",
      isActive: true,
    });
    console.log(`✅ New ADMIN user '${email}' created successfully.`);
  }

  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  await mongoose.disconnect();
}

const emailArg = process.argv[2] || "admin@fizzi.com";
const passArg = process.argv[3] || "Admin123!";
makeAdmin(emailArg, passArg).catch(console.error);
