const ApiError = (statusCode, message) => {
  const error = new Error(message || 'Error');
  error.statusCode = statusCode || 500;
  return error;
};

module.exports = ApiError;
