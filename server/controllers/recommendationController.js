const axios = require("axios");
const Recommendation = require("../models/Recommendation");

// GET /api/recommendations/:memberId
// Reads from the cache; does NOT call the ML service live (see architecture docs).
exports.getRecommendations = async (req, res) => {
  const rec = await Recommendation.findOne({ memberId: req.params.memberId }).populate("recommendedBooks");
  if (!rec) return res.json({ recommendedBooks: [] });
  res.json(rec);
};

// Internal: called by a refresh job (e.g. after a borrow event) — not exposed directly to the frontend
exports.refreshRecommendations = async (memberId) => {
  const { data } = await axios.get(`${process.env.ML_SERVICE_URL}/recommend/${memberId}`);
  await Recommendation.findOneAndUpdate(
    { memberId },
    { recommendedBooks: data.bookIds, generatedAt: new Date() },
    { upsert: true }
  );
};
