const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");
const AssessmentParticipant = require("../models/AssessmentParticipant");
const { Interviewer, Candidate } = require("../models/User");
const sendEmail = require("../utils/mailSender");

// 🔹 Reusable Styled HTML Email Template for Brevo
const buildEmailTemplate = ({
  role,
  assessmentName,
  hostName,
  scheduledText,
  primaryUrl,
  secondaryUrl,
  credentials,
}) => {
  const isInterviewer = role === "interviewer";
  const brandColor = isInterviewer ? "#6366f1" : "#a855f7";
  const roleTitle = isInterviewer ? "Co-Interviewer & Evaluator" : "Candidate Assessment";

  const credentialsBlock = credentials
    ? `
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Auto-Generated Access Account</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">Temporary Password: <strong style="color: #38bdf8; font-family: monospace; font-size: 16px; background: #1e293b; padding: 2px 8px; border-radius: 6px;">${credentials.password}</strong></p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">You can log in to view your dashboard using your email and this temporary key.</p>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0; padding:30px 10px; background-color:#0b0f19; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#e2e8f0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#131b2e; border:1px solid #1e293b; border-radius:18px; overflow:hidden; box-shadow:0 12px 35px rgba(0,0,0,0.5);">
        <tr>
          <td style="background:linear-gradient(135deg, ${brandColor} 0%, #3b82f6 100%); padding:28px 32px;">
            <span style="font-size:20px; font-weight:800; letter-spacing:-0.03em; color:#ffffff;">JobSphere</span>
            <div style="margin-top:6px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.85); text-transform:uppercase; letter-spacing:0.08em;">${roleTitle}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px 0; font-size:22px; font-weight:700; color:#ffffff;">Invitation: ${assessmentName}</h1>
            <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#94a3b8;">
              ${hostName ? `<strong>${hostName}</strong> has invited you` : "You have been invited"} to participate in the upcoming technical assessment on JobSphere.
            </p>

            ${scheduledText ? `
              <div style="display:inline-block; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px 16px; margin-bottom:20px;">
                <span style="color:#38bdf8; font-size:13px; font-weight:600;">🕒 Scheduled: </span>
                <span style="color:#f1f5f9; font-size:13px;">${scheduledText}</span>
              </div>
            ` : ""}

            ${credentialsBlock}

            <table border="0" cellpadding="0" cellspacing="0" style="margin:24px 0 16px 0;">
              <tr>
                <td align="center" style="border-radius:10px; background:${brandColor};">
                  <a href="${primaryUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">
                    ${isInterviewer ? "Open Assessment Hub" : "Enter Interview Room"}
                  </a>
                </td>
              </tr>
            </table>

            ${secondaryUrl ? `
              <p style="margin:16px 0 0 0; font-size:13px; color:#64748b;">
                Direct Live Video Call Link: <br/>
                <a href="${secondaryUrl}" style="color:#38bdf8; text-decoration:underline; word-break:break-all;">${secondaryUrl}</a>
              </p>
            ` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px; background:#0f172a; border-top:1px solid #1e293b; font-size:12px; color:#64748b; text-align:center;">
            JobSphere Collaboration Platform • Automated notification
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

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

    // Check if user already exists in DB
    let user = await UserModel.findOne({ email: cleanEmail });
    let isNewUser = false;
    let temporaryPassword = null;

    if (!user) {
      isNewUser = true;
      // Generate clean 8-character temporary password
      temporaryPassword = crypto.randomBytes(4).toString("hex");

      // Pass raw temporaryPassword — Mongoose UserSchema.pre('save') will hash it ONCE!
      user = await UserModel.create({
        name: customName,
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

    const scheduledText = assessment.scheduledAt
      ? new Date(assessment.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : null;

    const emailSubject = `JobSphere Invitation: ${assessment.name}`;
    const emailHtml = buildEmailTemplate({
      role,
      assessmentName: assessment.name,
      hostName: assessment.created_by?.name || req.user?.name,
      scheduledText,
      primaryUrl: role === "interviewer" ? workspaceUrl : liveInterviewUrl,
      secondaryUrl: role === "interviewer" ? liveInterviewUrl : null,
      credentials: isNewUser ? { password: temporaryPassword } : null,
    });

    // Attempt email delivery via Brevo
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