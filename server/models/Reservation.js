const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    status: {
      type: String,
      enum: ["waiting", "ready", "claimed", "expired", "cancelled"],
      default: "waiting",
    },
    notifiedAt: { type: Date, default: null },
    claimExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
