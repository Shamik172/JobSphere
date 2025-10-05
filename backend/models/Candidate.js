// models/Candidate.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const CandidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],
    profile: {
      phone: String,
      skills: [String],
      experience: Number, // years of experience
      resume: String, // file path or URL
    },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
CandidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // run only if password modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Compare entered password with hashed
CandidateSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Candidate", CandidateSchema);
