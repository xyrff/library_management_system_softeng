const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    activeRequestKey: { type: String, select: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned", "overdue"],
      default: "pending",
    },
    lateReturnRiskScore: { type: Number, default: null },
  },
  { timestamps: true }
);

transactionSchema.index(
  { activeRequestKey: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
