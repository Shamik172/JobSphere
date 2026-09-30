const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Assessment = require("../models/Assessment");
const AssessmentParticipant = require("../models/AssessmentParticipant");
const { Interviewer, Candidate } = require("../models/User");
const sendEmail = require("../utils/mailSender");
const { getNewUserInviteTemplate, getExistingUserInviteTemplate, } = require("../services/emailTemplates");

// --- 1. Create Assessment ---
exports.createAssessment = async (req, res) => {
  try {
    const { name, description, scheduledAt, duration } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    const newAssessment = new Assessment({
      name,
      description,
      scheduledAt: scheduledAt || null,
      duration: duration || 60,
      room_id: `room-${uuidv4()}`,
      created_by: req.user._id,
    });
    await newAssessment.save();

    // Automatically add creator as the host interviewer
    const creatorParticipant = new AssessmentParticipant({
      assessment: newAssessment._id,
      user: req.user._id,
      role: "interviewer",
      status: "Accepted",
    });
    await creatorParticipant.save();

    res.status(201).json(newAssessment);
  } catch (error) {
    res.status(500).json({ message: "Error creating assessment", error: error.message });
  }
};

// --- 2. Get Assessment Details (Interviewer Only) ---
exports.getAssessmentDetails = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;

    // Guard: Prevent candidate accounts from viewing question repositories
    if (req.user && req.user.role === "candidate") {
      return res.status(403).json({ message: "Access forbidden. Candidates cannot view assessment details." });
    }

    const assessment = await Assessment.findById(assessmentId)
      .populate("questions")
      .populate("created_by", "name email");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const participants = await AssessmentParticipant.find({ assessment: assessmentId })
      .populate("user", "name email");

    const response = {
      _id: assessment._id,
      name: assessment.name,
      description: assessment.description,
      scheduledAt: assessment.scheduledAt,
      duration: assessment.duration,
      roomId: assessment.room_id,
      createdBy: assessment.created_by,
      questions: assessment.questions || [],
      interviewers: participants
        .filter((p) => p.role === "interviewer" && p.user)
        .map((p) => ({
          participantId: p._id,
          userId: p.user._id,
          name: p.user.name,
          email: p.user.email,
          status: p.status,
          presence: p.presence, // added
        })),
      candidates: participants
        .filter((p) => p.role === "candidate" && p.user)
        .map((p) => ({
          participantId: p._id,
          userId: p.user._id,
          name: p.user.name,
          email: p.user.email,
          status: p.status,
          presence: p.presence, // added
        })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assessment details", error: error.message });
  }
};

// --- 3. Get User Assessments (Hosted + Collaborations) ---
exports.getMyAssessments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Assessments created by this user
    const hosted = await Assessment.find({ created_by: userId })
      .select("_id name description scheduledAt duration createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Assessments where user is invited as co-interviewer (exclude self-hosted)
    const collaboratorRecords = await AssessmentParticipant.find({
      user: userId,
      role: "interviewer",
    })
      .populate({
        path: "assessment",
        select: "_id name description scheduledAt duration created_by createdAt updatedAt",
      })
      .sort({ createdAt: -1 });

    const collaborator = collaboratorRecords
      .filter((p) => p.assessment && p.assessment.created_by?.toString() !== userId.toString())
      .map((p) => ({
        _id: p.assessment._id,
        name: p.assessment.name,
        description: p.assessment.description,
        scheduledAt: p.assessment.scheduledAt,
        duration: p.assessment.duration,
        createdAt: p.assessment.createdAt,
        updatedAt: p.assessment.updatedAt,
      }));

    return res.status(200).json({ hosted, collaborator });
  } catch (err) {
    console.error("Error fetching assessments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- 4. Invite Participant (Custom Name + Single Hash + Clean Template) ---
exports.inviteParticipant = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { email, role, name } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const customName = name && name.trim() ? name.trim() : cleanEmail.split("@")[0];

    const assessment = await Assessment.findById(assessmentId).populate("created_by", "name");
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const UserModel = role === "interviewer" ? Interviewer : Candidate;

    let user = await UserModel.findOne({ email: cleanEmail });
    let isNewUser = false;
    let temporaryPassword = null;

    if (!user) {
      isNewUser = true;
      temporaryPassword = crypto.randomBytes(4).toString("hex");

      user = await UserModel.create({
        name: customName,
        email: cleanEmail,
        password: temporaryPassword,
        role,
        isActivated: false,
      });
    }

    const existingParticipant = await AssessmentParticipant.findOne({
      assessment: assessmentId,
      user: user._id,
    });

    if (existingParticipant) {
      return res.status(409).json({ message: "This user has already been invited to this assessment." });
    }

    const newParticipant = new AssessmentParticipant({
      assessment: assessmentId,
      user: user._id,
      role,
      status: "Invited",
    });
    await newParticipant.save();

    const FRONTEND_URL = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";

    // 1. Full absolute URLs for email buttons
    const liveInterviewUrl = `${FRONTEND_URL}/videocall/${assessment._id}/${assessment.room_id}`;
    const absoluteWorkspaceUrl = `${FRONTEND_URL}/assessments/${assessment._id}`;
    const absoluteCandidateDashboardUrl = `${FRONTEND_URL}/candidate/my_assessment`;

    // 2. Relative destinations for the setup redirect parameter
    const destinationAfterSetup = role === "interviewer"
      ? `/assessments/${assessment._id}`
      : `/candidate/my_assessment`;

    const setupUrl = `${FRONTEND_URL}/setup-account?email=${encodeURIComponent(cleanEmail)}&redirect=${encodeURIComponent(destinationAfterSetup)}`;

    // In template calls:
    const emailHtml = isNewUser
      ? getNewUserInviteTemplate({
        name: customName,
        role,
        assessmentName: assessment.name,
        hostName: assessment.created_by?.name || req.user?.name,
        scheduledText,
        tempPassword: temporaryPassword,
        setupUrl,
        liveInterviewUrl,
      })
      : getExistingUserInviteTemplate({
        name: user.name,
        role,
        assessmentName: assessment.name,
        hostName: assessment.created_by?.name || req.user?.name,
        scheduledText,
        dashboardUrl: role === "interviewer" ? absoluteWorkspaceUrl : absoluteCandidateDashboardUrl, // 👈 Must be absolute!
        liveInterviewUrl,
      });

    try {
      await sendEmail(cleanEmail, emailSubject, emailHtml);
    } catch (mailError) {
      console.error("Mail dispatch failed, rolling back participant entry:", mailError);
      await AssessmentParticipant.findByIdAndDelete(newParticipant._id);
      return res.status(502).json({
        message: `Failed to deliver email to ${cleanEmail}. Please verify SMTP settings.`,
        error: mailError.message,
      });
    }

    return res.status(200).json({
      message: `Successfully invited ${cleanEmail}`,
      participant: {
        participantId: newParticipant._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role,
        status: "Invited",
      },
    });
  } catch (error) {
    console.error("Invitation Error:", error);
    return res.status(500).json({ message: "Error inviting participant", error: error.message });
  }
};

// --- 5. Resend Invitation Email ---
exports.resendInvite = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { participantId } = req.body;

    const participant = await AssessmentParticipant.findById(participantId).populate("user", "name email");
    if (!participant) return res.status(404).json({ message: "Participant record not found." });

    const assessment = await Assessment.findById(assessmentId).populate("created_by", "name");
    if (!assessment) return res.status(404).json({ message: "Assessment not found." });

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const liveInterviewUrl = `${FRONTEND_URL}/videocall/${assessment._id}/${assessment.room_id}`;
    const workspaceUrl = `${FRONTEND_URL}/assessments/${assessment._id}`;

    const scheduledText = assessment.scheduledAt
      ? new Date(assessment.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : null;

    const emailHtml = buildEmailTemplate({
      role: participant.role,
      assessmentName: assessment.name,
      hostName: assessment.created_by?.name || req.user?.name,
      scheduledText,
      primaryUrl: participant.role === "interviewer" ? workspaceUrl : liveInterviewUrl,
      secondaryUrl: participant.role === "interviewer" ? liveInterviewUrl : null,
      credentials: null,
    });

    await sendEmail(participant.user.email, `JobSphere Reminder: Invitation for ${assessment.name}`, emailHtml);

    res.status(200).json({ message: `Invitation resent to ${participant.user.email}` });
  } catch (err) {
    res.status(500).json({ message: "Error resending invitation", error: err.message });
  }
};

// --- 6. Remove Participant ---
exports.removeParticipant = async (req, res) => {
  try {
    const { id: assessmentId, participantId } = req.params;
    const participant = await AssessmentParticipant.findOneAndDelete({
      _id: participantId,
      assessment: assessmentId,
    });

    if (!participant) return res.status(404).json({ message: "Participant not found." });
    res.status(200).json({ message: "Participant removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error removing participant", error: err.message });
  }
};

// --- 7. Get Latest Assessments ---
exports.getLatestAssessments = async (req, res) => {
  try {
    const userId = req.user._id;

    const participantDocs = await AssessmentParticipant.find({
      user: userId,
      role: "interviewer",
    }).select("assessment");

    const assessmentIds = participantDocs.map((p) => p.assessment);

    const assessments = await Assessment.find({
      $or: [{ created_by: userId }, { _id: { $in: assessmentIds } }],
    })
      .populate({ path: "created_by", select: "name email" })
      .populate({ path: "questions", select: "title difficulty" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const assessmentsWithParticipants = await Promise.all(
      assessments.map(async (a) => {
        const participants = await AssessmentParticipant.find({
          assessment: a._id,
        })
          .populate("user", "name email")
          .lean();

        const interviewers = participants.filter((p) => p.role === "interviewer").map((p) => p.user);
        const candidates = participants.filter((p) => p.role === "candidate").map((p) => p.user);

        return {
          ...a,
          participants: {
            interviewers,
            candidates,
          },
        };
      })
    );

    res.status(200).json({
      total: assessmentsWithParticipants.length,
      assessments: assessmentsWithParticipants,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Error fetching latest assessments" });
  }
};


// --- 8. Acknowledge Invitation (Invited -> Accepted) ---
// Triggered when an invited interviewer loads /assessments/:id
exports.acknowledgeInvitation = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const userId = req.user._id;

    const participant = await AssessmentParticipant.findOne({
      assessment: assessmentId,
      user: userId,
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant record not found." });
    }

    if (participant.status === "Invited") {
      participant.status = "Accepted";
      await participant.save();
    }

    res.status(200).json({ message: "Invitation acknowledged", status: participant.status });
  } catch (error) {
    res.status(500).json({ message: "Error acknowledging invite", error: error.message });
  }
};

// --- 9. Verify Video Room Access ---
// Checks if the logged-in candidate or interviewer is actually registered in this assessment
exports.verifyRoomAccess = async (req, res) => {
  try {
    const { id: assessmentId, roomId } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment does not exist." });
    }

    if (assessment.room_id !== roomId) {
      return res.status(400).json({ message: "Invalid room identifier." });
    }

    const participant = await AssessmentParticipant.findOne({
      assessment: assessmentId,
      user: userId,
    });

    if (!participant) {
      return res.status(403).json({
        message: "Forbidden: You are not an enrolled participant for this assessment.",
      });
    }

    // Automatically transition candidate to "Accepted" once they successfully verify into the call
    if (participant.status === "Invited") {
      participant.status = "Accepted";
      await participant.save();
    }

    res.status(200).json({
      authorized: true,
      role: participant.role,
      status: participant.status,
      assessmentName: assessment.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// --- 10. Update Assessment Status (e.g. Host clicks "End Assessment") ---
exports.updateAssessmentStatus = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { status } = req.body; // 'Scheduled' | 'In Progress' | 'Completed'

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    // Host interviewer guard
    if (assessment.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can modify the assessment status." });
    }

    assessment.status = status;
    await assessment.save();

    if (status === "Completed") {
      await AssessmentParticipant.updateMany(
        { assessment: assessmentId, status: "Accepted" },
        { status: "Completed" }
      );
    }

    res.status(200).json({ message: `Assessment updated to ${status}`, assessment });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};


// Candidate explicitly accepts the assessment invitation
exports.acceptCandidateInvite = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const candidateId = req.user._id;

    const participant = await AssessmentParticipant.findOne({
      assessment: assessmentId,
      user: candidateId,
    });

    if (!participant) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    participant.status = "Accepted";
    await participant.save();

    return res.status(200).json({
      success: true,
      message: "Invitation accepted!",
      status: "Accepted",
    });
  } catch (err) {
    console.error("Accept invite error:", err);
    return res.status(500).json({ message: "Failed to accept invitation." });
  }
};

// Candidate declines the invitation (removes them from enrollment)
exports.declineCandidateInvite = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const candidateId = req.user._id;

    const participant = await AssessmentParticipant.findOneAndDelete({
      assessment: assessmentId,
      user: candidateId,
    });

    if (!participant) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Invitation declined and removed.",
    });
  } catch (err) {
    console.error("Decline invite error:", err);
    return res.status(500).json({ message: "Failed to decline invitation." });
  }
};