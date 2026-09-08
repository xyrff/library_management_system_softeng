const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, unique: true },
    recommendedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
