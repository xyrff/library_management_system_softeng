const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    reservedDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["pending", "fulfilled", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
