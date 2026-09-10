const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Member = require("../models/Member");

dotenv.config();

const adminCredentials = {
  name: "Library Administrator",
  email: "admin@library.local",
  password: "AdminPassword123!",
};

const seedAdmin = async () => {
  await connectDB();

  const existing = await Member.findOne({ email: adminCredentials.email });
  if (existing) {
    console.log(`Admin account already exists for ${adminCredentials.email}`);
    await Member.db.close();
    return;
  }

  const passwordHash = await bcrypt.hash(adminCredentials.password, 10);
  await Member.create({
    name: adminCredentials.name,
    email: adminCredentials.email,
    passwordHash,
    memberType: "faculty",
    role: "admin",
  });

  console.log("Admin account created:");
  console.log(`  email: ${adminCredentials.email}`);
  console.log(`  password: ${adminCredentials.password}`);
  await Member.db.close();
};

seedAdmin().catch(async (err) => {
  console.error("Admin seed failed:", err.message);
  await Member.db.close();
  process.exitCode = 1;
});
