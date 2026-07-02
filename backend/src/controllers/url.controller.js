const prisma = require("../config/prisma");
const { nanoid } = require("nanoid");

// =====================================
// Create Short URL
// =====================================
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    console.log("========== CREATE SHORT URL ==========");
    console.log("Request Body:", req.body);

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const shortCode = nanoid(7);

    console.log("Generated Short Code:", shortCode);

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId: req.user.id,
      },
    });

    console.log("URL Saved Successfully");
    console.log(url);

    return res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `http://localhost:5000/${url.shortCode}`,
      },
    });
  } catch (error) {
    console.error("========== SHORTEN URL ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================
// Redirect Short URL
// =====================================
const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    console.log("\n========================================");
    console.log("REDIRECT REQUEST RECEIVED");
    console.log("Short Code:", shortCode);
    console.log("========================================");

    // Find URL
    const url = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    console.log("Database Result:", url);

    // URL not found
    if (!url) {
      console.log("❌ URL NOT FOUND");

      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      console.log("❌ URL EXPIRED");

      return res.status(410).json({
        success: false,
        message: "This short URL has expired",
      });
    }

    console.log("Current Click Count:", url.clicks);

    // Increment clicks
    const updatedUrl = await prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    console.log("Updated Click Count:", updatedUrl.clicks);
    console.log("Redirecting To:", url.originalUrl);

    return res.redirect(302, url.originalUrl);

  } catch (error) {
    console.error("========== REDIRECT ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
};