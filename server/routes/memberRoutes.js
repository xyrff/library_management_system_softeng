const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { createStaff, getMembers, getMemberById, updateMember } = require("../controllers/memberController");

router.post("/create-staff", protect, authorize("librarian", "admin"), createStaff);
router.get("/", protect, authorize("librarian", "admin"), getMembers);
router.get("/:id", protect, getMemberById);
router.put("/:id", protect, updateMember);

module.exports = router;
