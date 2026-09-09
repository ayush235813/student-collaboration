const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

// Middleware to protect routes — verifies JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return next(new ApiError(401, 'Not authorized, user not found'));
      }

      next();
    } catch (error) {
      return next(new ApiError(401, 'Not authorized, token failed or expired'));
    }
  } else {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }
};

module.exports = { protect };
