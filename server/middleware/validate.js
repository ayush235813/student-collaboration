// Simple request validation middleware
// This is a placeholder — will be enhanced with express-validator in Phase 11

// Validate that required fields exist in request body
const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { validateFields };
