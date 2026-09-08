const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    memberType: { type: String, enum: ["student", "faculty"], required: true },
    role: { type: String, enum: ["member", "librarian", "admin"], default: "member" },
    lateReturnHistory: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
