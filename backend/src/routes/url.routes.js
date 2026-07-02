const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  shortenUrl,
  redirectUrl,
} = require("../controllers/url.controller");

// Protected Route - Create Short URL
router.post("/shorten", authMiddleware, shortenUrl);

// Public Route - Redirect Short URL
router.get("/:shortCode", redirectUrl);

module.exports = router;