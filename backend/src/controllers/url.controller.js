const prisma = require("../config/prisma");
const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
// =====================================
// Create Short URL
// =====================================
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    let shortCode = customAlias ? customAlias.trim() : nanoid(7);

    const existingUrl = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    if (existingUrl) {
      return res.status(409).json({
        success: false,
        message: "Custom alias already exists",
      });
    }

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `http://localhost:5000/${url.shortCode}`,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
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

// =====================================
// Get My URLs (with Pagination)
// =====================================
const getMyUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const totalUrls = await prisma.url.count({
      where: {
        userId: req.user.id,
      },
    });

    const urls = await prisma.url.findMany({
      where: {
        userId: req.user.id,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalUrls / limit),
      totalUrls,
      count: urls.length,
      data: urls.map((url) => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `http://localhost:5000/${url.shortCode}`,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      })),
    });

  } catch (error) {
    console.error("GET URLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================
// Search URLs
// =====================================
const searchUrls = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const urls = await prisma.url.findMany({
      where: {
        userId: req.user.id,
        OR: [
          {
            originalUrl: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            shortCode: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: urls.length,
      data: urls.map((url) => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `http://localhost:5000/${url.shortCode}`,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      })),
    });

  } catch (error) {
    console.error("SEARCH URL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// =====================================
// Get URL Analytics
// =====================================
const getUrlAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (url.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this URL",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `http://localhost:5000/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        user: url.user,
      },
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================
// Generate QR Code
// =====================================
const generateQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({
      where: {
        id,
      },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (url.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this URL",
      });
    }

    const shortUrl = `http://localhost:5000/${url.shortCode}`;

    const qrCode = await QRCode.toDataURL(shortUrl);

    return res.status(200).json({
      success: true,
      message: "QR Code generated successfully",
      data: {
        originalUrl: url.originalUrl,
        shortUrl,
        qrCode,
      },
    });

  } catch (error) {
    console.error("QR CODE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// =====================================
// Update URL
// =====================================
const updateUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const url = await prisma.url.findUnique({
      where: {
        id,
      },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (url.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this URL",
      });
    }

    const updatedUrl = await prisma.url.update({
      where: {
        id,
      },
      data: {
        originalUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "URL updated successfully",
      data: updatedUrl,
    });
  } catch (error) {
    console.error("UPDATE URL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================
// Delete URL
// =====================================
const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({
      where: {
        id,
      },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (url.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this URL",
      });
    }

    await prisma.url.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("DELETE URL ERROR:", error);

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

    const url = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "This short URL has expired",
      });
    }

    await prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("REDIRECT URL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  shortenUrl,
  getMyUrls,
  searchUrls,
  getUrlAnalytics,
  generateQrCode,
  updateUrl,
  deleteUrl,
  redirectUrl,
};