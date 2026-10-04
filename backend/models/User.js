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

  profilePic: {
    type: String,
    default: "",
  },

  isActivated: {
    type: Boolean,
    default: true,
  },

  // Multiple active activation tokens to support concurrent assessment invites (company A company B company C invites)
  activationTokens: [
    {
      token: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    },
  ],

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

const User = mongoose.model('User', UserSchema);

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