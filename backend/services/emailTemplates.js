/**
 * Email Templates for JobSphere Assessments & Onboarding
 */

const baseEmailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { padding: 28px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1e293b; background: #0b1120; }
    .header h1 { margin: 0; font-size: 24px; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .badge-interviewer { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-candidate { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
    .details-box { background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; margin: 18px 0; }
    .credential-box { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 18px; margin: 18px 0; }
    .btn { display: inline-block; width: 100%; text-align: center; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff !important; text-decoration: none; padding: 13px 20px; font-weight: 700; border-radius: 10px; box-sizing: border-box; font-size: 14px; margin-top: 8px; }
    .btn-secondary { display: inline-block; width: 100%; text-align: center; background: #1e293b; color: #38bdf8 !important; border: 1px solid #334155; text-decoration: none; padding: 11px 20px; font-weight: 600; border-radius: 10px; box-sizing: border-box; font-size: 13px; margin-top: 10px; }
    .footer { padding: 18px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>JobSphere</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} JobSphere • Real-Time Technical Assessment Platform</p>
    </div>
  </div>
</body>
</html>
`;

exports.getNewUserInviteTemplate = ({ name, role, assessmentName, hostName, scheduledText, tempPassword, setupUrl, liveInterviewUrl }) => {
  const isInterviewer = role === "interviewer";
  return baseEmailWrapper(`
    <span class="badge ${isInterviewer ? 'badge-interviewer' : 'badge-candidate'}">
      ${isInterviewer ? 'Co-Interviewer Invitation' : 'Candidate Interview Invitation'}
    </span>
    <h2 style="margin: 0 0 10px 0; color: #f8fafc; font-size: 20px;">Welcome to JobSphere, ${name}!</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      <strong>${hostName}</strong> has invited you to participate in <strong>"${assessmentName}"</strong>.
      An account has been created for you. Activate it with your temporary password to access your dashboard.
    </p>

    <div class="credential-box">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">Temporary Login Password</p>
      <div style="font-size: 14px; color: #e2e8f0;">Password: <code style="background: #1e293b; padding: 3px 8px; border-radius: 6px; font-family: monospace; color: #f59e0b; font-weight: bold;">${tempPassword}</code></div>
    </div>

    ${scheduledText ? `
      <div class="details-box">
        <span style="font-size: 11px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 2px;">SCHEDULED DATE & TIME</span>
        <span style="font-size: 14px; font-weight: 700; color: #ffffff;">${scheduledText}</span>
      </div>
    ` : ''}

    <!-- Primary Action: Set up account -->
    <a href="${setupUrl}" class="btn">Set Up Account & Go to Dashboard</a>

    <!-- Direct Interview Room Link -->
    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Or join the live interview room directly:</p>
      <a href="${liveInterviewUrl}" class="btn-secondary">Enter Live Interview Room</a>
    </div>
  `);
};

exports.getExistingUserInviteTemplate = ({ name, role, assessmentName, hostName, scheduledText, dashboardUrl, liveInterviewUrl }) => {
  const isInterviewer = role === "interviewer";
  return baseEmailWrapper(`
    <span class="badge ${isInterviewer ? 'badge-interviewer' : 'badge-candidate'}">
      ${isInterviewer ? 'Co-Interviewer Invitation' : 'Candidate Interview Invitation'}
    </span>
    <h2 style="margin: 0 0 10px 0; color: #f8fafc; font-size: 20px;">Hello, ${name}</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      <strong>${hostName}</strong> has invited you to <strong>"${assessmentName}"</strong>.
    </p>

    ${scheduledText ? `
      <div class="details-box">
        <span style="font-size: 11px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 2px;">SCHEDULED DATE & TIME</span>
        <span style="font-size: 14px; font-weight: 700; color: #ffffff;">${scheduledText}</span>
      </div>
    ` : ''}

    <!-- Primary Action -->
    <a href="${dashboardUrl}" class="btn">${isInterviewer ? 'Open Assessment Hub' : 'View on Dashboard'}</a>

    <!-- Direct Live Call Link -->
    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Or jump straight into the video call:</p>
      <a href="${liveInterviewUrl}" class="btn-secondary">Enter Live Interview Room</a>
    </div>
  `);
};

exports.getAccountActivatedTemplate = ({ name }) => {
  return baseEmailWrapper(`
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="display: inline-block; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; color: #34d399; font-size: 22px;">✓</div>
    </div>
    <h2 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 20px; text-align: center;">Account Setup Complete</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 16px 0;">
      Hello <strong>${name}</strong>, your permanent password is confirmed and your account is fully activated.
    </p>
  `);
};