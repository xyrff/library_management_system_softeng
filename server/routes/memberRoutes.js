const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getMembers, getMemberById, updateMember } = require("../controllers/memberController");

router.get("/", protect, authorize("librarian", "admin"), getMembers);
router.get("/:id", protect, getMemberById);
router.put("/:id", protect, updateMember);

module.exports = router;
