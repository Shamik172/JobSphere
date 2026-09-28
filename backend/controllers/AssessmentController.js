const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");
const AssessmentParticipant = require("../models/AssessmentParticipant");
const { Interviewer, Candidate } = require("../models/User");
const sendEmail = require("../utils/mailSender");

// --- 1. Create Assessment ---
exports.createAssessment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    const newAssessment = new Assessment({
      name,
      description,
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

    const assessment = await Assessment.findById(assessmentId).populate("questions");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const participants = await AssessmentParticipant.find({ assessment: assessmentId })
      .populate("user", "name email");

    const response = {
      _id: assessment._id,
      name: assessment.name,
      description: assessment.description,
      roomId: assessment.room_id,
      questions: assessment.questions || [],
      interviewers: participants
        .filter((p) => p.role === "interviewer" && p.user)
        .map((p) => ({
          name: p.user.name,
          email: p.user.email,
          status: p.status,
        })),
      candidates: participants
        .filter((p) => p.role === "candidate" && p.user)
        .map((p) => ({
          name: p.user.name,
          email: p.user.email,
          status: p.status,
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
      .select("_id name description createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Assessments where user is invited as co-interviewer (exclude self-hosted)
    const collaboratorRecords = await AssessmentParticipant.find({
      user: userId,
      role: "interviewer",
    })
      .populate({
        path: "assessment",
        select: "_id name description created_by createdAt updatedAt",
      })
      .sort({ createdAt: -1 });

    const collaborator = collaboratorRecords
      .filter((p) => p.assessment && p.assessment.created_by?.toString() !== userId.toString())
      .map((p) => ({
        _id: p.assessment._id,
        name: p.assessment.name,
        description: p.assessment.description,
        createdAt: p.assessment.createdAt,
        updatedAt: p.assessment.updatedAt,
      }));

    return res.status(200).json({ hosted, collaborator });
  } catch (err) {
    console.error("Error fetching assessments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- 4. Invite Participant (FIXED: No Password Overwriting + Hashed Defaults + Clean URLs) ---
// Inside assessmentController.js -> inviteParticipant
exports.inviteParticipant = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const UserModel = role === "interviewer" ? Interviewer : Candidate;

    // 3. Check if user already exists in DB
    let user = await UserModel.findOne({ email: cleanEmail });
    let isNewUser = false;
    let temporaryPassword = null;

    if (!user) {
      isNewUser = true;
      // Generate clean 8-character temporary password
      temporaryPassword = crypto.randomBytes(4).toString("hex");

      // Pass raw temporaryPassword — Mongoose UserSchema.pre('save') will hash it ONCE!
      user = await UserModel.create({
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        password: temporaryPassword,
        role,
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

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const liveInterviewUrl = `${FRONTEND_URL}/videocall/${assessment._id}/${assessment.room_id}`;
    const workspaceUrl = `${FRONTEND_URL}/assessments/${assessment._id}`;

    let emailSubject = `JobSphere: Invitation for ${assessment.name}`;
    let emailBody = "";

    const credentialsSection = isNewUser
      ? `
        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #374151;">An account has been created for your email on JobSphere:</p>
          <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: bold; color: #111827;">Temporary Password: <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #6b7280;">Log in with your email and this password to access your dashboard.</p>
        </div>
      `
      : "";

    if (role === "interviewer") {
      emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #4338ca;">You're Invited to Collaborate</h2>
          <p>You have been invited to be a <strong>co-interviewer</strong> for <strong>${assessment.name}</strong>.</p>
          ${credentialsSection}
          <p>Collaborate with the team, manage question lists, and review candidates:</p>
          <p style="margin: 20px 0;">
            <a href="${workspaceUrl}" style="background-color: #4f46e5; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Open Assessment Hub</a>
          </p>
          <p style="font-size: 13px; color: #6b7280;">When it is time for the live interview, join the video room directly:</p>
          <p><a href="${liveInterviewUrl}" style="color: #4f46e5; text-decoration: underline;">${liveInterviewUrl}</a></p>
        </div>
      `;
    } else {
      emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #7c3aed;">Invitation to Technical Interview</h2>
          <p>You have been invited to take the technical assessment for <strong>${assessment.name}</strong>.</p>
          ${credentialsSection}
          <p>At your scheduled time, enter your interview session using the button below:</p>
          <p style="margin: 20px 0;">
            <a href="${liveInterviewUrl}" style="background-color: #7c3aed; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Join Live Assessment</a>
          </p>
          <p style="font-size: 13px; color: #6b7280;">Make sure your camera and microphone permissions are enabled prior to joining.</p>
        </div>
      `;
    }

    // Attempt email delivery
    try {
      await sendEmail(cleanEmail, emailSubject, emailBody);
    } catch (mailError) {
      console.error("Mail dispatch failed, rolling back participant entry:", mailError);
      // Clean up participant entry if email failed to avoid phantom invitations
      await AssessmentParticipant.findByIdAndDelete(newParticipant._id);
      return res.status(502).json({
        message: `Failed to deliver email to ${cleanEmail}. Please verify SMTP settings.`,
        error: mailError.message,
      });
    }

    return res.status(200).json({
      message: `Successfully invited ${cleanEmail}`,
      participant: {
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

// --- 5. Get Latest Assessments ---
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