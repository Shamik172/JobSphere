const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    room_id: {
      type: String,
      required: true,
      unique: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    scheduledAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 60, // in minutes
    },
    // Lifecycle status of the overall assessment
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);