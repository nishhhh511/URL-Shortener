const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { shortenUrl } = require("../controllers/url.controller");

router.post("/shorten", authMiddleware, shortenUrl);

module.exports = router;