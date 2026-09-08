const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getRecommendations } = require("../controllers/recommendationController");

router.get("/:memberId", protect, getRecommendations);

module.exports = router;
