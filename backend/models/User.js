const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Base Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  // Common field for all users
  profilePic: {
    type: String,
    default: "", // Cloudinary URL or blank
  },

  // Account activation tracking
  isActivated: {
    type: Boolean,
    default: true,
  },

}, {
  timestamps: true,
  discriminatorKey: 'role',
});

// Password Hashing Middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password Comparison Method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create Base Model
const User = mongoose.model('User', UserSchema);

// Create Discriminators (Specialized roles)
const Interviewer = User.discriminator('interviewer', new mongoose.Schema({
  company: { type: String, required: false },
  department: { type: String, required: false },
  position: { type: String, required: false },
  companyProof: { type: String },
}));

const Candidate = User.discriminator('candidate', new mongoose.Schema({
  resume_url: { type: String },
  education: { type: String },
  skills: { type: [String] },
  experience: { type: String },
}));

module.exports = { User, Interviewer, Candidate };