const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadProfilePicture } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Cloudinary upload middleware

// All user routes require authentication
router.use(protect);

// Profile management
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// Profile picture upload
router.put('/profile-picture', upload.single('image'), uploadProfilePicture);

module.exports = router;
