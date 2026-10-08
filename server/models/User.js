const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  college: { type: String, default: "" },
  course: { type: String, default: "" },
  semester: { type: Number, default: 1 },
  skills: [{ type: String }],
  interests: [{ type: String }],
  bio: { type: String, default: "", maxlength: 500 },
  githubUrl: { type: String, default: "", match: [/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/?$/, 'Please provide a valid GitHub URL'] },
  linkedinUrl: { type: String, default: "", match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL'] },
  profilePicture: { type: String, default: "" },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date }
}, { 
  timestamps: true 
});

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
