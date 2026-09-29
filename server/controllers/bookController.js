const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const Reservation = require("../models/Reservation");

const getCoverUrl = (coverUrl, isbn) => {
  if (typeof coverUrl === "string" && coverUrl.trim()) return coverUrl;
  return isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg` : undefined;
};

exports.getBooks = async (req, res) => {
  // TODO: support search/filter query params (genre, author, availability)
  const books = await Book.find();
  res.json(books);
};

exports.getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
};

exports.createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    delete bookData.availableCopies;
    bookData.availableCopies = bookData.totalCopies;
    bookData.coverUrl = getCoverUrl(bookData.coverUrl, bookData.isbn);

    const book = await Book.create(bookData);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const editableFields = ["title", "author", "genre", "isbn", "description", "shelfLocation"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) book[field] = req.body[field];
    });

    if (req.body.coverUrl !== undefined || req.body.isbn !== undefined) {
      book.coverUrl = getCoverUrl(req.body.coverUrl, book.isbn);
    }

    if (req.body.totalCopies !== undefined) {
      const currentlyBorrowed = book.totalCopies - book.availableCopies;
      const newTotalCopies = Number(req.body.totalCopies);
      if (newTotalCopies < currentlyBorrowed) {
        return res.status(400).json({
          message: `Cannot reduce total copies below the number currently borrowed (${currentlyBorrowed})`,
        });
      }
      book.totalCopies = req.body.totalCopies;
      book.availableCopies = newTotalCopies - currentlyBorrowed;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const [activeTransaction, activeReservation] = await Promise.all([
      Transaction.exists({ bookId: book._id, status: { $in: ["pending", "approved", "overdue"] } }),
      Reservation.exists({ bookId: book._id, status: { $in: ["pending", "waiting", "ready"] } }),
    ]);

    if (activeTransaction || activeReservation) {
      return res.status(400).json({
        message: "Book cannot be deleted while it has active loans, requests, or reservations",
      });
    }

    await book.deleteOne();
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
