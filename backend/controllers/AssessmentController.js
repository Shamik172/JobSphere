const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Assessment = require("../models/Assessment");
const AssessmentParticipant = require("../models/AssessmentParticipant");
const { User, Interviewer, Candidate } = require("../models/User");
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
      status: assessment.status,
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
          profilePic: p.user.profilePic,
          status: p.status,
          presence: p.presence,
        })),
      candidates: participants
        .filter((p) => p.role === "candidate" && p.user)
        .map((p) => ({
          participantId: p._id,
          userId: p.user._id,
          name: p.user.name,
          email: p.user.email,
          profilePic: p.user.profilePic,
          status: p.status,
          presence: p.presence,
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

    // 1. Fetch assessments created by the user (Host)
    const hostedAssessments = await Assessment.find({ created_by: userId })
      .select("name description scheduledAt duration status room_id createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch assessments where the user is an enrolled participant (Collaborator)
    const coInterviewerParticipations = await AssessmentParticipant.find({
      user: userId,
      role: "interviewer",
    }).select("assessment").lean();

    const collabAssessmentIds = coInterviewerParticipations.map((p) => p.assessment);

    const collaboratorAssessments = await Assessment.find({
      _id: { $in: collabAssessmentIds },
      created_by: { $ne: userId },
    })
      .select("name description scheduledAt duration status room_id createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Helper to attach lightweight previews and metrics
    const attachCardMetadata = async (assessmentList) => {
      return Promise.all(
        assessmentList.map(async (item) => {
          // Get candidate participants
          const candidateParticipants = await AssessmentParticipant.find({
            assessment: item._id,
            role: "candidate",
          })
            .populate("user", "name email profilePic")
            .select("user status")
            .lean();

          // Get interviewer count
          const interviewerCount = await AssessmentParticipant.countDocuments({
            assessment: item._id,
            role: "interviewer",
          });

          // Extract candidate preview (up to 3 for avatar ring)
          const candidates = candidateParticipants.map((p) => ({
            name: p.user?.name || "Candidate",
            email: p.user?.email || "",
            profilePic: p.user?.profilePic || "",
            status: p.status,
          }));

          return {
            ...item,
            roomId: item.room_id,
            candidateCount: candidateParticipants.length,
            interviewerCount,
            questionCount: Array.isArray(item.questions) ? item.questions.length : 0,
            candidates: candidates.slice(0, 3), // First 3 for avatar stack
            totalCandidates: candidates.length,
          };
        })
      );
    };

    const [hosted, collaborator] = await Promise.all([
      attachCardMetadata(hostedAssessments),
      attachCardMetadata(collaboratorAssessments),
    ]);

    return res.status(200).json({ hosted, collaborator });
  } catch (err) {
    console.error("getMyAssessments Error:", err);
    return res.status(500).json({ message: "Server error fetching assessments directory" });
  }
};

// --- 4. Invite Participant ---
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

    if (assessment.status === "Completed") {
      return res.status(400).json({ message: "Cannot invite participants to a completed assessment." });
    }

    const UserModel = role === "interviewer" ? Interviewer : Candidate;
    let user = await UserModel.findOne({ email: cleanEmail });

    let temporaryKey = null;
    let isActivationNeeded = false;

    if (!user) {
      // 1. Completely new user
      temporaryKey = crypto.randomBytes(4).toString("hex"); // 8-char hex
      const dummyPassword = crypto.randomBytes(16).toString("hex");

      user = await UserModel.create({
        name: customName,
        email: cleanEmail,
        password: dummyPassword,
        role,
        isActivated: false,
        activationTokens: [
          {
            token: temporaryKey,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days validity
            assessmentId: assessment._id,
          },
        ],
      });
      isActivationNeeded = true;
    } else if (!user.isActivated) {
      // 2. Existing user who has NOT yet activated (e.g. invited by another panel earlier)
      temporaryKey = crypto.randomBytes(4).toString("hex");

      // Clean up expired tokens and append this new invitation token
      user.activationTokens = (user.activationTokens || []).filter(
        (t) => new Date(t.expiresAt) > new Date()
      );
      user.activationTokens.push({
        token: temporaryKey,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assessmentId: assessment._id,
      });

      if (customName && (!user.name || user.name === cleanEmail.split("@")[0])) {
        user.name = customName;
      }
      await user.save();
      isActivationNeeded = true;
    }

    // Check if already invited to THIS assessment
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
    const liveInterviewUrl = `${FRONTEND_URL}/videocall/${assessment._id}/${assessment.room_id}`;
    const absoluteWorkspaceUrl = `${FRONTEND_URL}/assessments/${assessment._id}`;
    const absoluteCandidateDashboardUrl = `${FRONTEND_URL}/candidate/my_assessment`;

    const destinationAfterSetup = role === "interviewer"
      ? `/assessments/${assessment._id}`
      : `/candidate/my_assessment`;

    // 🌟 Pass both email and token in the setupUrl for 1-click verification
    const setupUrl = temporaryKey
      ? `${FRONTEND_URL}/setup-account?email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(temporaryKey)}&redirect=${encodeURIComponent(destinationAfterSetup)}`
      : `${FRONTEND_URL}/setup-account?email=${encodeURIComponent(cleanEmail)}&redirect=${encodeURIComponent(destinationAfterSetup)}`;

    const scheduledText = assessment.scheduledAt
      ? new Date(assessment.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : null;

    const emailSubject = `JobSphere Invitation: ${assessment.name}`;

    const emailHtml = isActivationNeeded
      ? getNewUserInviteTemplate({
          name: customName,
          role,
          assessmentName: assessment.name,
          hostName: assessment.created_by?.name || req.user?.name,
          scheduledText,
          tempPassword: temporaryKey,
          setupUrl,
          liveInterviewUrl,
        })
      : getExistingUserInviteTemplate({
          name: user.name,
          role,
          assessmentName: assessment.name,
          hostName: assessment.created_by?.name || req.user?.name,
          scheduledText,
          dashboardUrl: role === "interviewer" ? absoluteWorkspaceUrl : absoluteCandidateDashboardUrl,
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

    const assessment = await Assessment.findById(assessmentId).populate("created_by", "name");
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    if (assessment.status === "Completed") {
      return res.status(400).json({ message: "Cannot resend invites for a completed assessment." });
    }

    const participant = await AssessmentParticipant.findById(participantId).populate("user");
    if (!participant) return res.status(404).json({ message: "Participant record not found." });

    const user = participant.user;
    let temporaryKey = null;
    let isActivationNeeded = false;

    if (!user.isActivated) {
      temporaryKey = crypto.randomBytes(4).toString("hex");
      user.activationTokens = (user.activationTokens || []).filter(
        (t) => new Date(t.expiresAt) > new Date()
      );
      user.activationTokens.push({
        token: temporaryKey,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assessmentId: assessment._id,
      });
      await user.save();
      isActivationNeeded = true;
    }

    const FRONTEND_URL = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
    const liveInterviewUrl = `${FRONTEND_URL}/videocall/${assessment._id}/${assessment.room_id}`;
    const absoluteWorkspaceUrl = `${FRONTEND_URL}/assessments/${assessment._id}`;
    const absoluteCandidateDashboardUrl = `${FRONTEND_URL}/candidate/my_assessment`;

    const destinationAfterSetup = participant.role === "interviewer"
      ? `/assessments/${assessment._id}`
      : `/candidate/my_assessment`;

    const setupUrl = temporaryKey
      ? `${FRONTEND_URL}/setup-account?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(temporaryKey)}&redirect=${encodeURIComponent(destinationAfterSetup)}`
      : `${FRONTEND_URL}/setup-account?email=${encodeURIComponent(user.email)}&redirect=${encodeURIComponent(destinationAfterSetup)}`;

    const scheduledText = assessment.scheduledAt
      ? new Date(assessment.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : null;

    const emailSubject = `JobSphere Reminder: ${assessment.name}`;

    const emailHtml = isActivationNeeded
      ? getNewUserInviteTemplate({
          name: user.name,
          role: participant.role,
          assessmentName: assessment.name,
          hostName: assessment.created_by?.name || req.user?.name,
          scheduledText,
          tempPassword: temporaryKey,
          setupUrl,
          liveInterviewUrl,
        })
      : getExistingUserInviteTemplate({
          name: user.name,
          role: participant.role,
          assessmentName: assessment.name,
          hostName: assessment.created_by?.name || req.user?.name,
          scheduledText,
          dashboardUrl: participant.role === "interviewer" ? absoluteWorkspaceUrl : absoluteCandidateDashboardUrl,
          liveInterviewUrl,
        });

    await sendEmail(user.email, emailSubject, emailHtml);

    return res.status(200).json({ message: `Reminder delivered to ${user.email}` });
  } catch (err) {
    console.error("Resend Invite Error:", err);
    return res.status(500).json({ message: "Error resending invitation", error: err.message });
  }
};

// --- 6. Remove Participant ---
exports.removeParticipant = async (req, res) => {
  try {
    if (assessment.status === "Completed") {
      return res.status(400).json({ message: "Cannot remove participants from a completed assessment." });
    }
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

    // 1. Check if the session has already been concluded by the host
    if (assessment.status === "Completed") {
      return res.status(403).json({
        message: "This assessment session has already been concluded by the host.",
      });
    }

    const isHost = assessment.created_by.toString() === userId.toString();
    const participant = await AssessmentParticipant.findOne({
      assessment: assessmentId,
      user: userId,
    });

    if (!participant && !isHost) {
      return res.status(403).json({
        message: "Forbidden: You are not an enrolled participant for this assessment.",
      });
    }

    // 2. Automatically transition candidate/panelist to "Accepted" once they enter the room
    if (participant && participant.status === "Invited") {
      participant.status = "Accepted";
      await participant.save();
    }

    return res.status(200).json({
      authorized: true,
      role: isHost ? "host" : participant.role,
      status: participant ? participant.status : "Accepted",
      assessmentName: assessment.name,
    });
  } catch (error) {
    console.error("verifyRoomAccess error:", error);
    return res.status(500).json({ message: "Verification failed", error: error.message });
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
      // 1. Mark all participants as Completed
      await AssessmentParticipant.updateMany(
        { assessment: assessmentId },
        { $set: { status: "Completed", presence: "Offline" } }
      );

      // 2. Broadcast session termination to the room via Socket.io
      const io = req.app.get("io");
      if (io && assessment.room_id) {
        io.to(assessment.room_id).emit("assessment-terminated", {
          message: "The host has concluded this interview session.",
          assessmentId: assessment._id,
        });
        console.log(`[Socket] assessment-terminated broadcasted to room: ${assessment.room_id}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Assessment marked as ${status}`,
      assessment
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: "Error updating status", error: error.message });
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