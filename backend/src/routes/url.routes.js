const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  shortenUrl,
  getMyUrls,
  deleteUrl,
  redirectUrl,
} = require("../controllers/url.controller");

// =====================================
// Protected Routes
// =====================================

// Create Short URL
router.post("/shorten", authMiddleware, shortenUrl);

// Get Logged-in User's URLs
router.get("/my-urls", authMiddleware, getMyUrls);

// Delete URL
router.delete("/:id", authMiddleware, deleteUrl);

// =====================================
// Public Route
// =====================================

// Redirect Short URL
router.get("/:shortCode", redirectUrl);

module.exports = router;