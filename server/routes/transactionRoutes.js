const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  borrowBook,
  approveRequest,
  rejectRequest,
  getPendingRequests,
  returnBook,
  getTransactions,
} = require("../controllers/transactionController");

router.post("/borrow", protect, borrowBook);
router.post("/:id/approve", protect, authorize("librarian", "admin"), approveRequest);
router.post("/:id/reject", protect, authorize("librarian", "admin"), rejectRequest);
router.get("/pending", protect, authorize("librarian", "admin"), getPendingRequests);
router.post("/:id/return", protect, authorize("librarian", "admin"), returnBook);
router.get("/", protect, getTransactions);

module.exports = router;
