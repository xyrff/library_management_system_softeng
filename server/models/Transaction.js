const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ["borrowed", "returned", "overdue"], default: "borrowed" },
    lateReturnRiskScore: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
