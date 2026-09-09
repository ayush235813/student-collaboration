const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/apiError');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, course, semester, skills, interests, bio } = req.body;

    // Check if required fields exist
    if (!name || !email || !password) {
      return next(new ApiError(400, 'Please provide name, email, and password'));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college,
      course,
      semester,
      skills: skills || [],
      interests: interests || [],
      bio
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        token: generateToken(user._id)
      });
    } else {
      return next(new ApiError(400, 'Invalid user data received'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ApiError(400, 'Please provide an email and password'));
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Update last seen status
      user.lastSeen = Date.now();
      user.isOnline = true;
      await user.save({ validateBeforeSave: false }); // Skip validation just for this update

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          college: user.college
        },
        token: generateToken(user._id)
      });
    } else {
      return next(new ApiError(401, 'Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set in the auth middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
