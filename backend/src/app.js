const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const urlRoutes = require("./routes/url.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener API is running 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/url", urlRoutes);

module.exports = app;