/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An internal server error occurred';

  // Specific error handling
  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (err.message.includes('Invalid')) {
    statusCode = 400;
  } else if (err.message.includes('rate limit')) {
    statusCode = 429;
  } else if (err.message.includes('API key')) {
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
