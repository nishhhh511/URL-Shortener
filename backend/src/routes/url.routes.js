const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  shortenUrl,
  getMyUrls,
  searchUrls,
  getUrlAnalytics,
  generateQrCode,
  updateUrl,
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

// Get Analytics
router.get("/analytics/:id", authMiddleware, getUrlAnalytics);
router.get("/search", authMiddleware, searchUrls);
// Generate QR Code
router.get("/qr/:id", authMiddleware, generateQrCode);

// Update URL
router.put("/:id", authMiddleware, updateUrl);

// Delete URL
router.delete("/:id", authMiddleware, deleteUrl);

// =====================================
// Public Route
// =====================================

router.get("/:shortCode", redirectUrl);

module.exports = router;