const mongoose = require('mongoose');

const assessmentParticipantSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['interviewer', 'candidate'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Invited', 'Accepted', 'Completed'],
        default: 'Invited',
    },
    // Real-time call presence tracked via WebRTC / socket events
    presence: {
        type: String,
        enum: ['Offline', 'In Call'],
        default: 'Offline',
    },
}, { 
    timestamps: true 
});

// Compound index to guarantee uniqueness per user per assessment
assessmentParticipantSchema.index({ assessment: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentParticipant', assessmentParticipantSchema);