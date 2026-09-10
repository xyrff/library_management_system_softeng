const bcrypt = require("bcryptjs");
const Member = require("../models/Member");

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["librarian", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be librarian or admin" });
    }

    const existing = await Member.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const member = await Member.create({
      name,
      email,
      passwordHash,
      memberType: "faculty",
      role,
    });

    res.status(201).json({ id: member._id, name: member.name, email: member.email, role: member.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMembers = async (req, res) => {
  const members = await Member.find().select("-passwordHash");
  res.json(members);
};

exports.getMemberById = async (req, res) => {
  const member = await Member.findById(req.params.id).select("-passwordHash");
  if (!member) return res.status(404).json({ message: "Member not found" });
  res.json(member);
};

exports.updateMember = async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-passwordHash");
  res.json(member);
};
