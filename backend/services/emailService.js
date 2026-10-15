
import nodemailer from "nodemailer";

const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.warn("Email skipped: SMTP is not configured.");
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    // Email failure should not undo a successful application or interview update.
    console.error("Email delivery failed:", error.message);
    return { sent: false, reason: "DELIVERY_FAILED" };
  }
}

export async function sendShortlistEmail({
  to,
  studentName,
  driveTitle,
}) {
  const name = escapeHtml(studentName || "Student");
  const drive = escapeHtml(driveTitle || "Placement Drive");

  return sendEmail({
    to,
    subject: `CampusHire: You've been shortlisted for ${driveTitle}`,
    text:
      `Hello ${studentName || "Student"},\n\n` +
      `Congratulations! You have been shortlisted for ${driveTitle}.\n` +
      "Please sign in to CampusHire to check your application status and interview updates.",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Congratulations, ${name}!</h2>
        <p>You have been shortlisted for <strong>${drive}</strong>.</p>
        <p>Please sign in to CampusHire to check your application status
        and future interview updates.</p>
        <p>Best wishes,<br/>CampusHire Team</p>
      </div>
    `,
  });
}

export async function sendInterviewScheduledEmail({
  to,
  studentName,
  driveTitle,
  roundName,
  startsAt,
  endsAt,
  mode,
  location,
  meetingLink,
}) {
  const name = escapeHtml(studentName || "Student");
  const drive = escapeHtml(driveTitle || "Placement Drive");
  const round = escapeHtml(roundName || "Interview");
  const start = new Date(startsAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const end = new Date(endsAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const place =
    mode === "ONLINE"
      ? `Meeting link: ${meetingLink || "Check CampusHire"}`
      : `Location: ${location || "Check CampusHire"}`;

  const details = escapeHtml(place);
  const safeStart = escapeHtml(start);
  const safeEnd = escapeHtml(end);

  return sendEmail({
    to,
    subject: `CampusHire: Interview scheduled - ${driveTitle}`,
    text:
      `Hello ${studentName || "Student"},\n\n` +
      `Your ${roundName} for ${driveTitle} has been scheduled.\n` +
      `Start: ${start}\nEnd: ${end}\n${place}\n\n` +
      "Please sign in to CampusHire for your interview details.",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Interview Scheduled</h2>
        <p>Hello ${name},</p>
        <p>Your <strong>${round}</strong> for <strong>${drive}</strong>
        has been scheduled.</p>
        <p><strong>Start:</strong> ${safeStart}</p>
        <p><strong>End:</strong> ${safeEnd}</p>
        <p>${details}</p>
        <p>Please sign in to CampusHire for your interview details.</p>
        <p>Regards,<br/>CampusHire Team</p>
      </div>
    `,
  });
}

export async function sendInterviewCancelledEmail({
  to,
  studentName,
  driveTitle,
  roundName,
  startsAt,
}) {
  const name = escapeHtml(studentName || "Student");
  const drive = escapeHtml(driveTitle || "Placement Drive");
  const round = escapeHtml(roundName || "Interview");
  const start = new Date(startsAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return sendEmail({
    to,
    subject: `CampusHire: Interview cancelled - ${driveTitle}`,
    text:
      `Hello ${studentName || "Student"},\n\n` +
      `Your ${roundName} for ${driveTitle} scheduled at ${start} has been cancelled.\n` +
      "Please sign in to CampusHire for further updates.",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Interview Update</h2>
        <p>Hello ${name},</p>
        <p>Your <strong>${round}</strong> for <strong>${drive}</strong>,
        scheduled at ${escapeHtml(start)}, has been cancelled.</p>
        <p>Please sign in to CampusHire for further updates.</p>
        <p>Regards,<br/>CampusHire Team</p>
      </div>
    `,
  });
}
