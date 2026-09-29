const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getMyFines } = require("../controllers/fineController");

router.get("/my", protect, getMyFines);

module.exports = router;
