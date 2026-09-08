const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require("../controllers/bookController");

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, authorize("librarian", "admin"), createBook);
router.put("/:id", protect, authorize("librarian", "admin"), updateBook);
router.delete("/:id", protect, authorize("librarian", "admin"), deleteBook);

module.exports = router;
