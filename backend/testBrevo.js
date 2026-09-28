require("dotenv").config();
const sendEmail = require("./utils/mailSender");

async function run() {
  try {
    // Put any email address you want to receive the invite at
    const recipient = "shamik.2023ca88@mnnit.ac.in"; 

    console.log("Dispatching test email via Brevo...");
    await sendEmail(
      recipient,
      "JobSphere Test: Invitation Service",
      "<h2>Success!</h2><p>Your JobSphere invitation mailer is operational and ready for deployment.</p>"
    );
    console.log("🎉 Test email sent successfully!");
  } catch (err) {
    console.error("Test failed:", err.message);
  }
  process.exit();
}

run();