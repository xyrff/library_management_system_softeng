const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { borrowBook, returnBook, getTransactions } = require("../controllers/transactionController");

router.post("/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);
router.get("/", protect, getTransactions);

module.exports = router;
