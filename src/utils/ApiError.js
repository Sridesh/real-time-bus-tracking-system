class ApiError extends Error {
  constructor(statusCode, message) {
    super(message || 'Error');
    this.statusCode = statusCode || 500;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

module.exports = ApiError;
