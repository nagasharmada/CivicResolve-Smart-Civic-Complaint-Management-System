module.exports = (err, req, res, next) => {
  console.error("Error:", err.message);

  // Handle specific PostgreSQL error (duplicate email)
  if (err.code === "23505") {
    return res.status(400).json({
      error: "Duplicate value violates unique constraint",
      detail: err.detail,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};