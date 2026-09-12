const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    genre: { type: String, required: true },
    description: { type: String },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    shelfLocation: { type: String },
    coverUrl: {
      type: String,
      default: function getCoverUrl() {
        return this.isbn
          ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(this.isbn)}-L.jpg`
          : undefined;
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
