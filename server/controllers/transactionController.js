const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Fine = require("../models/Fine");
const Reservation = require("../models/Reservation");
const { holdNextReservation, promoteNextReservation } = require("./reservationController");
const { computeLateReturnRisk } = require("../services/lateReturnRisk");

const RATE_PER_DAY = 5;
const MAX_FINE = 150;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// POST /api/transactions/borrow
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, borrowDate, returnDate } = req.body;
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ message: "A valid bookId is required" });
    }
    if (!borrowDate || !returnDate) {
      return res.status(400).json({ message: "borrowDate and returnDate are required" });
    }

    const parsedBorrowDate = new Date(borrowDate);
    const parsedReturnDate = new Date(returnDate);
    if (
      Number.isNaN(parsedBorrowDate.getTime()) ||
      Number.isNaN(parsedReturnDate.getTime()) ||
      parsedReturnDate <= parsedBorrowDate
    ) {
      return res.status(400).json({ message: "returnDate must be after borrowDate" });
    }

    const existingActiveTransaction = await Transaction.findOne({
      bookId,
      memberId: req.user.id,
      status: { $in: ["pending", "approved", "overdue"] },
    }).select("_id");
    if (existingActiveTransaction) {
      return res.status(409).json({
        message: "You already have an active request or loan for this book",
      });
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: "Book is not currently available to request" });
    }

    const transaction = await Transaction.create({
      bookId,
      memberId: req.user.id,
      activeRequestKey: `${bookId}:${req.user.id}`,
      borrowDate: parsedBorrowDate,
      dueDate: parsedReturnDate,
      status: "pending",
    });

    try {
      const member = await Member.findById(req.user.id);
      if (!member) throw new Error("Member not found");
      transaction.lateReturnRiskScore = await computeLateReturnRisk(
        book, member, parsedBorrowDate, parsedReturnDate
      );
      await transaction.save();
    } catch (mlErr) {
      console.error("ML service unavailable:", mlErr.message);
      // Non-blocking: borrowing still succeeds even if the ML service is down.
    }

    res.status(201).json(transaction);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You already have an active request or loan for this book",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { $set: { status: "approved" } },
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Pending transaction not found" });
    }

    if (transaction.reservationId) {
      const reservation = await Reservation.findOneAndUpdate(
        { _id: transaction.reservationId, status: "ready" },
        { $set: { status: "claimed" }, $unset: { claimExpiresAt: 1 } },
        { new: true }
      );
      if (!reservation) {
        await Transaction.findOneAndUpdate(
          { _id: transaction._id, status: "approved" },
          { $set: { status: "pending" } }
        );
        return res.status(409).json({
          message: "This reservation is no longer available to claim",
        });
      }
      return res.json(transaction);
    }

    const book = await Book.findOneAndUpdate(
      { _id: transaction.bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!book) {
      await Transaction.findOneAndUpdate(
        { _id: transaction._id, status: "approved" },
        { $set: { status: "pending" } }
      );
      return res.status(409).json({
        message: "This request cannot be approved because no copies are currently available",
      });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { $set: { status: "rejected" }, $unset: { activeRequestKey: 1 } },
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Pending transaction not found" });
    }
    if (transaction.reservationId) {
      const reservation = await Reservation.findOneAndUpdate(
        { _id: transaction.reservationId, status: "ready" },
        { $set: { status: "expired" }, $unset: { claimExpiresAt: 1 } },
        { new: true }
      );
      if (!reservation) {
        return res.status(409).json({
          message: "The linked reservation is no longer available to reject",
        });
      }
      await promoteNextReservation(reservation.bookId);
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/transactions/pending
exports.getPendingRequests = async (req, res) => {
  try {
    await Transaction.updateMany(
      { status: "approved", dueDate: { $lt: new Date() } },
      { $set: { status: "overdue" } }
    );
    const transactions = await Transaction.find({ status: "pending" })
      .populate("bookId", "title author")
      .populate("memberId", "name email");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/:id/return
exports.returnBook = async (req, res) => {
  try {
    const returnDate = new Date();
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ["approved", "overdue"] } },
      { $set: { status: "returned", returnDate }, $unset: { activeRequestKey: 1 } },
      { new: true }
    );
    if (!transaction) {
      const existing = await Transaction.findById(req.params.id).select("status");
      if (!existing) return res.status(404).json({ message: "Transaction not found" });
      return res.status(400).json({ message: "Only approved or overdue loans can be returned" });
    }

    const book = await Book.findByIdAndUpdate(
      transaction.bookId,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );
    if (!book) {
      await Transaction.findOneAndUpdate(
        { _id: transaction._id, status: "returned" },
        {
          $set: {
            status: "approved",
            returnDate: null,
            activeRequestKey: `${transaction.bookId}:${transaction.memberId}`,
          },
        }
      );
      return res.status(404).json({ message: "Book for this transaction was not found" });
    }
    await holdNextReservation(transaction.bookId);

    const wasLate = returnDate > transaction.dueDate;

    if (wasLate) {
      const daysLate = Math.ceil((returnDate - transaction.dueDate) / MILLISECONDS_PER_DAY);
      const amount = Math.min(daysLate * RATE_PER_DAY, MAX_FINE);
      await Fine.create({
        transactionId: transaction._id,
        memberId: transaction.memberId,
        amount,
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
  try {
    await Transaction.updateMany(
      { status: "approved", dueDate: { $lt: new Date() } },
      { $set: { status: "overdue" } }
    );
    const filter = req.user.role === "member" ? { memberId: req.user.id } : {};
    if (req.query.status && req.user.role !== "member") {
      const statuses = req.query.status.split(",").filter(Boolean);
      if (statuses.length > 0) filter.status = { $in: statuses };
    }
    const transactions = await Transaction.find(filter).populate("bookId memberId");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
