const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for the developer
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    res.status(404);
  }

  // Mongoose duplicate key (e.g., duplicate email)
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    res.status(400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;