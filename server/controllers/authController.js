const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const generateToken = (member) =>
  jwt.sign(
    { id: member._id, role: member.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

exports.register = async (req, res) => {
  try {
    const { name, email, password, memberType } = req.body;
    const existing = await Member.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const member = await Member.create({ name, email, passwordHash, memberType });

    res.status(201).json({ token: generateToken(member), role: member.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await Member.findOne({ email });
    if (!member) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, member.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(member), role: member.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  const member = await Member.findById(req.user.id).select('name email role');
  if (!member) return res.status(401).json({ message: "User not found" });
  res.json(member);
};
