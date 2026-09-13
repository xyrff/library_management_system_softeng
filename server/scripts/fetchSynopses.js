const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Book = require("../models/Book");

dotenv.config();

// Small delay between requests so we don't hammer Open Library's free API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchSynopsis = async (isbn) => {
    try {
        // Step 1: look up the edition by ISBN to find its parent "work"
        const editionRes = await axios.get(
            `https://openlibrary.org/isbn/${isbn}.json`
        );
        const workKey = editionRes.data?.works?.[0]?.key; // e.g. "/works/OL262758W"
        if (!workKey) return null;

        // Step 2: fetch the work, which usually holds the description
        const workRes = await axios.get(`https://openlibrary.org${workKey}.json`);
        const description = workRes.data?.description;

        // description can be a plain string OR an object like { type: '...', value: '...' }
        if (typeof description === "string") return description;
        if (description?.value) return description.value;

        return null;
    } catch (err) {
        return null; // book not found, no internet for that one, etc. — just skip it
    }
};

const fetchAllSynopses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const books = await Book.find();
        console.log(`Found ${books.length} books total.`);

        for (const book of books) {
            // Don't overwrite a description someone already wrote/set manually
            if (book.description && book.description.trim().length > 0) {
                console.log(`Skipped (already has description): ${book.title}`);
                continue;
            }

            if (!book.isbn) {
                console.log(`Skipped (no ISBN): ${book.title}`);
                continue;
            }

            const synopsis = await fetchSynopsis(book.isbn);

            if (synopsis) {
                book.description = synopsis;
                await book.save();
                console.log(`Updated: ${book.title}`);
            } else {
                console.log(`No synopsis found: ${book.title}`);
            }

            await sleep(500); // be polite to Open Library's free API
        }

        console.log("Done fetching synopses.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

fetchAllSynopses();