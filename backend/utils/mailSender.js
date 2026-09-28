// utils/mailSender.js

const mailSender = async (email, title, body) => {
  try {
    if (!email || !title || !body) {
      throw new Error("Missing recipient, subject, or email body.");
    }

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not defined in environment variables.");
    }

    if (!process.env.SENDER_EMAIL) {
      throw new Error("SENDER_EMAIL is not defined in environment variables.");
    }

    const payload = {
      sender: {
        name: "Team JOBSPHERE",
        email: process.env.SENDER_EMAIL.trim(),
      },
      to: [
        {
          email: email.trim(),
        },
      ],
      subject: title,
      htmlContent: body,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY.trim(),
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Response Error:", data);
      throw new Error(data.message || "Failed to send email through Brevo API");
    }

    console.log(`✉️ Email successfully delivered to: ${email} | MessageId: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error(`❌ Mail dispatch failed to ${email}:`, error.message);
    throw error;
  }
};

module.exports = mailSender;