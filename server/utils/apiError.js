// Custom error class for API errors
// Usage: throw new ApiError(404, 'Resource not found');
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
