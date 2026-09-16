const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");

const CLAIM_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
const getClaimExpiry = (readyAt) => new Date(readyAt.getTime() + CLAIM_WINDOW_MS);
const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const parseClaimDates = (borrowDate, returnDate) => {
  if (!borrowDate || !returnDate) {
    return { error: "borrowDate and returnDate are required" };
  }

  const parsedBorrowDate = new Date(borrowDate);
  const parsedReturnDate = new Date(returnDate);
  if (Number.isNaN(parsedBorrowDate.getTime()) || Number.isNaN(parsedReturnDate.getTime())) {
    return { error: "borrowDate and returnDate must be valid dates" };
  }
  if (String(borrowDate).slice(0, 10) !== getTodayDate()) {
    return { error: "borrowDate must be today" };
  }
  if (parsedReturnDate <= parsedBorrowDate) {
    return { error: "returnDate must be after borrowDate" };
  }

  return { parsedBorrowDate, parsedReturnDate };
};

const promoteReservationUpdate = () => {
  const readyAt = new Date();
  return {
    $set: {
      status: "ready",
      readyAt,
      notifiedAt: readyAt,
      claimExpiresAt: getClaimExpiry(readyAt),
    },
  };
};

const promoteNextReservation = async (bookId) => {
  const next = await Reservation.findOneAndUpdate(
    { bookId, status: "waiting" },
    promoteReservationUpdate(),
    { sort: { createdAt: 1 }, new: true }
  );
  if (next) return next;
  await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
  return null;
};

const expireReservation = async (reservation) => {
  const cutoff = new Date(Date.now() - CLAIM_WINDOW_MS);
  const expired = await Reservation.findOneAndUpdate(
    { _id: reservation._id, status: "ready", readyAt: { $lte: cutoff } },
    { $set: { status: "expired" }, $unset: { claimExpiresAt: 1 } },
    { new: true }
  );
  return expired ? promoteNextReservation(expired.bookId) : null;
};

const processExpiredReservations = async (bookId) => {
  const cutoff = new Date(Date.now() - CLAIM_WINDOW_MS);
  const filter = bookId
    ? { bookId, status: "ready", readyAt: { $lte: cutoff } }
    : { status: "ready", readyAt: { $lte: cutoff } };
  const expired = await Reservation.find(filter).sort({ readyAt: 1 });
  for (const reservation of expired) await expireReservation(reservation);
};

const holdNextReservation = async (bookId) => {
  const next = await Reservation.findOneAndUpdate(
    { bookId, status: "waiting" },
    promoteReservationUpdate(),
    { sort: { createdAt: 1 }, new: true }
  );
  if (!next) return false;

  const heldBook = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );
  if (!heldBook) {
    await Reservation.findOneAndUpdate(
      { _id: next._id, status: "ready" },
      { $set: { status: "waiting", readyAt: null, notifiedAt: null, claimExpiresAt: null } }
    );
    return false;
  }
  return true;
};

exports.promoteNextReservation = promoteNextReservation;
exports.holdNextReservation = holdNextReservation;
exports.processExpiredReservations = processExpiredReservations;

exports.createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).json({ message: "A valid bookId is required" });
    await processExpiredReservations(bookId);
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies > 0) return res.status(400).json({ message: "Book is available; request to borrow it instead" });

    const existing = await Reservation.findOne({
      bookId, memberId: req.user.id, status: { $in: ["waiting", "ready"] },
    });
    if (existing) return res.status(409).json({ message: "You already have an active reservation for this book" });

    const reservation = await Reservation.create({ bookId, memberId: req.user.id, status: "waiting" });
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    await processExpiredReservations();
    const reservations = await Reservation.find({ memberId: req.user.id })
      .sort({ createdAt: -1 }).populate("bookId", "title author isbn");
    const result = await Promise.all(reservations.map(async (reservation) => {
      const item = reservation.toObject();
      if (item.status === "waiting") {
        const activeLoan = await Transaction.findOne({
          bookId: item.bookId._id, status: { $in: ["approved", "overdue"] },
        }).sort({ dueDate: 1 }).select("dueDate");
        item.estimatedAvailableDate = activeLoan
          ? new Date(activeLoan.dueDate.getTime() + CLAIM_WINDOW_MS) : null;
      }
      return item;
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.claimReservation = async (req, res) => {
  try {
    await processExpiredReservations();
    const { borrowDate, returnDate } = req.body;
    const dates = parseClaimDates(borrowDate, returnDate);
    if (dates.error) return res.status(400).json({ message: dates.error });

    const reservationState = await Reservation.findOne({
      _id: req.params.id,
      memberId: req.user.id,
    }).select("status readyAt");
    if (!reservationState) return res.status(404).json({ message: "Reservation not found" });
    if (reservationState.status === "expired") {
      return res.status(400).json({ message: "Reservation has expired and can no longer be claimed" });
    }
    if (reservationState.status !== "ready") {
      return res.status(400).json({ message: "Reservation is not ready to be claimed" });
    }

    const reservation = await Reservation.findOneAndUpdate(
      {
        _id: req.params.id,
        memberId: req.user.id,
        status: "ready",
        readyAt: { $gt: new Date(Date.now() - CLAIM_WINDOW_MS) },
      },
      { $set: { status: "claimed" } },
      { new: true }
    );
    if (!reservation) return res.status(400).json({ message: "Reservation is no longer available to claim" });

    let transaction;
    try {
      transaction = await Transaction.create({
        bookId: reservation.bookId, memberId: reservation.memberId,
        activeRequestKey: `${reservation.bookId}:${reservation.memberId}`,
        borrowDate: dates.parsedBorrowDate,
        dueDate: dates.parsedReturnDate,
        status: "approved",
      });
    } catch (err) {
      await Reservation.findOneAndUpdate(
        { _id: reservation._id, status: "claimed" },
        { $set: { status: "ready" } }
      );
      throw err;
    }
    res.status(201).json({ reservation, transaction });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You already have an active request or loan for this book",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    await processExpiredReservations();
    const reservation = await Reservation.findOne({
      _id: req.params.id, memberId: req.user.id, status: { $in: ["waiting", "ready"] },
    });
    if (!reservation) return res.status(404).json({ message: "Active reservation not found" });

    const wasReady = reservation.status === "ready";
    reservation.status = "cancelled";
    await reservation.save();
    if (wasReady) await promoteNextReservation(reservation.bookId);
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
