const axios = require("axios");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Fine = require("../models/Fine");

// POST /api/transactions/borrow
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, memberId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: "Book not available" });
    }

    const transaction = await Transaction.create({ bookId, memberId, dueDate });

    // Call the ML service for a late-return risk score.
    // TODO: replace with real feature values once member/book history logic is built.
    try {
      const member = await Member.findById(memberId);
      const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/predict-late-return`, {
        memberType: member.memberType,
        lateReturnHistory: member.lateReturnHistory,
        genre: book.genre,
      });
      transaction.lateReturnRiskScore = data.riskScore;
      await transaction.save();
    } catch (mlErr) {
      console.error("ML service unavailable:", mlErr.message);
      // Non-blocking: borrowing still succeeds even if the ML service is down.
    }

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/:id/return
exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    transaction.returnDate = new Date();
    const wasLate = transaction.returnDate > transaction.dueDate;
    transaction.status = "returned";
    await transaction.save();

    const book = await Book.findById(transaction.bookId);
    book.availableCopies += 1;
    await book.save();

    if (wasLate) {
      await Fine.create({
        transactionId: transaction._id,
        memberId: transaction.memberId,
        amount: 0, // TODO: calculate based on days late / fine policy
      });
      await Member.findByIdAndUpdate(transaction.memberId, { $inc: { lateReturnHistory: 1 } });
    }

    // TODO: check Reservation queue for this book and notify next member in line

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  const filter = req.user.role === "member" ? { memberId: req.user.id } : {};
  const transactions = await Transaction.find(filter).populate("bookId memberId");
  res.json(transactions);
};
