const Member = require("../models/Member");

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
