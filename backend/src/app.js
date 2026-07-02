const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const urlRoutes = require("./routes/url.routes");
const { redirectUrl } = require("./controllers/url.controller");

const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ================= Health Check =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener API is running 🚀",
  });
});

// ================= API Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/url", urlRoutes);

// ================= Public Redirect =================
app.get("/:shortCode", redirectUrl);

module.exports = app;