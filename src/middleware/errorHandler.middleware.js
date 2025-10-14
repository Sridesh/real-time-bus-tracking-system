const logger = require('../config/logger.config');

/**
 * Standardized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
  next();
};

module.exports = errorHandler;
