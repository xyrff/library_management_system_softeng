const axios = require("axios");

const computeLateReturnRisk = async (book, member, borrowDate, returnDate) => {
  const dayOfWeekBorrowed = (borrowDate.getDay() + 6) % 7;
  const loanDurationDays = Math.round(
    (returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/predict-late-return`, {
    genre: book.genre,
    dayOfWeekBorrowed,
    lateReturnHistory: member.lateReturnHistory,
    loanDurationDays,
  });

  if (!Number.isFinite(data.riskScore)) {
    throw new Error("ML service returned an invalid late-return risk score");
  }
  return data.riskScore;
};

module.exports = { computeLateReturnRisk };
