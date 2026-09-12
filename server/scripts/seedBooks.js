const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("../models/Book");

dotenv.config();

const books = [
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780446310789",
        coverUrl: "https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg",
        genre: "Fiction",
        description: "A story about racial injustice in the American South.",
        totalCopies: 4,
        availableCopies: 3,
    },
    {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "9780553380163",
        coverUrl: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
        genre: "Science",
        description: "An exploration of cosmology for general readers.",
        totalCopies: 2,
        availableCopies: 0,
    },

];

const seedBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        for (const bookData of books) {
            const existing = await Book.findOne({ isbn: bookData.isbn });
            if (existing) {
                if (!existing.coverUrl) {
                    existing.coverUrl = bookData.coverUrl;
                    await existing.save();
                    console.log(`Updated cover URL: ${bookData.title}`);
                } else {
                    console.log(`Skipped (already exists): ${bookData.title}`);
                }
            } else {
                await Book.create(bookData);
                console.log(`Inserted: ${bookData.title}`);
            }
        }

        console.log("Done seeding books.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding books:", err.message);
        process.exit(1);
    }
};

seedBooks();