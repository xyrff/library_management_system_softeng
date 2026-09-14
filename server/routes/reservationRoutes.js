const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createReservation,
  getMyReservations,
  claimReservation,
  cancelReservation,
} = require("../controllers/reservationController");

router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.post("/:id/claim", protect, claimReservation);
router.post("/:id/cancel", protect, cancelReservation);

module.exports = router;
