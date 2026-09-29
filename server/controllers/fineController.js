const Fine = require("../models/Fine");

exports.getMyFines = async (req, res) => {
  try {
    const fines = await Fine.find({ memberId: req.user.id, paid: false }).populate({
      path: "transactionId",
      select: "bookId",
      populate: {
        path: "bookId",
        select: "title",
      },
    });
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
