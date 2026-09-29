const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/fines", require("./routes/fineRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));

app.get("/", (req, res) => {
  res.send("Library Management System API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
