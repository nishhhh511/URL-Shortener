const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("========== GLOBAL ERROR ==========");
    console.error(err);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
