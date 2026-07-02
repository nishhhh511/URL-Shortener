const prisma = require("../config/prisma");
const { nanoid } = require("nanoid");

const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const shortCode = nanoid(7);

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId: req.user.id,
      },
    });

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
    console.error("SHORTEN URL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  shortenUrl,
};