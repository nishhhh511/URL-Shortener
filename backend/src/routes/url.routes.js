const express = require("express");
const { body, param, query } = require("express-validator");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

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
/**
 * @swagger
 * /api/url/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 example: https://example.com/long/path
 *               customAlias:
 *                 type: string
 *                 example: my-link
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Short URL created
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/shorten",
  authMiddleware,
  [
    body("originalUrl")
      .isURL({ require_protocol: true })
      .withMessage("A valid URL with http or https is required"),
    body("customAlias")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^[A-Za-z0-9_-]{3,32}$/)
      .withMessage("Custom alias must be 3-32 letters, numbers, dashes, or underscores"),
    body("expiresAt")
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage("Expiry date must be a valid ISO date"),
  ],
  validate,
  shortenUrl
);

// Get Logged-in User's URLs
/**
 * @swagger
 * /api/url/my-urls:
 *   get:
 *     summary: Get logged-in user's URLs
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: URL list
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/my-urls",
  authMiddleware,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  validate,
  getMyUrls
);

// Get Analytics
/**
 * @swagger
 * /api/url/analytics/{id}:
 *   get:
 *     summary: Get URL analytics
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL analytics
 *       404:
 *         description: URL not found
 */
router.get(
  "/analytics/:id",
  authMiddleware,
  [param("id").notEmpty().withMessage("URL id is required")],
  validate,
  getUrlAnalytics
);
/**
 * @swagger
 * /api/url/search:
 *   get:
 *     summary: Search logged-in user's URLs
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query is required
 */
router.get(
  "/search",
  authMiddleware,
  [
    query("query")
      .trim()
      .notEmpty()
      .withMessage("Search query is required"),
  ],
  validate,
  searchUrls
);
// Generate QR Code
/**
 * @swagger
 * /api/url/qr/{id}:
 *   get:
 *     summary: Generate a QR code for a short URL
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code generated
 *       404:
 *         description: URL not found
 */
router.get(
  "/qr/:id",
  authMiddleware,
  [param("id").notEmpty().withMessage("URL id is required")],
  validate,
  generateQrCode
);

// Update URL
/**
 * @swagger
 * /api/url/{id}:
 *   put:
 *     summary: Update a URL
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: URL updated
 *       404:
 *         description: URL not found
 */
router.put(
  "/:id",
  authMiddleware,
  [
    param("id").notEmpty().withMessage("URL id is required"),
    body("originalUrl")
      .isURL({ require_protocol: true })
      .withMessage("A valid URL with http or https is required"),
  ],
  validate,
  updateUrl
);

// Delete URL
/**
 * @swagger
 * /api/url/{id}:
 *   delete:
 *     summary: Delete a URL
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL deleted
 *       404:
 *         description: URL not found
 */
router.delete(
  "/:id",
  authMiddleware,
  [param("id").notEmpty().withMessage("URL id is required")],
  validate,
  deleteUrl
);

// =====================================
// Public Route
// =====================================

/**
 * @swagger
 * /api/url/{shortCode}:
 *   get:
 *     summary: Redirect a short URL
 *     tags:
 *       - URLs
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: Short URL not found
 */
router.get(
  "/:shortCode",
  [
    param("shortCode")
      .matches(/^[A-Za-z0-9_-]+$/)
      .withMessage("Short code is invalid"),
  ],
  validate,
  redirectUrl
);

module.exports = router;
