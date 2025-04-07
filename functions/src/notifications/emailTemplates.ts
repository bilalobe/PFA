import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

const db = admin.firestore();
const config = functions.config();

// Initialize nodemailer with SMTP settings
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: true,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<void> {
  try {
    const mailOptions = {
      from: config.smtp.from,
      to,
      subject: replaceTemplateVars(template.subject, data),
      html: replaceTemplateVars(template.html, data),
      text: replaceTemplateVars(template.text, data),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    functions.logger.error("Error sending email:", error);
    throw error;
  }
}

function replaceTemplateVars(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => data[key.trim()] || "");
}

// Email templates
export const templates = {
  welcome: {
    subject: "Welcome to {{platformName}}!",
    html: `
      <h1>Welcome to {{platformName}}!</h1>
      <p>Hi {{userName}},</p>
      <p>Thank you for joining {{platformName}}. We're excited to have you on board!</p>
      <p>To get started:</p>
      <ul>
        <li>Complete your <a href="{{profileUrl}}">profile</a></li>
        <li>Browse our <a href="{{coursesUrl}}">course catalog</a></li>
        <li>Join our <a href="{{communityUrl}}">learning community</a></li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The {{platformName}} Team</p>
    `,
    text: `
Welcome to {{platformName}}!

Hi {{userName}},

Thank you for joining {{platformName}}. We're excited to have you on board!

To get started:
- Complete your profile: {{profileUrl}}
- Browse our course catalog: {{coursesUrl}}
- Join our learning community: {{communityUrl}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{platformName}} Team
    `,
  },

  assignmentDue: {
    subject: "Assignment Due Soon: {{assignmentName}}",
    html: `
      <h2>Assignment Reminder</h2>
      <p>Hi {{userName}},</p>
      <p>This is a reminder that your assignment "{{assignmentName}}" for {{courseName}} is due {{dueDate}}.</p>
      <p><a href="{{assignmentUrl}}">View Assignment</a></p>
      <p>Don't forget to submit your work before the deadline!</p>
    `,
    text: `
Assignment Reminder

Hi {{userName}},

This is a reminder that your assignment "{{assignmentName}}" for {{courseName}} is due {{dueDate}}.

View Assignment: {{assignmentUrl}}

Don't forget to submit your work before the deadline!
    `,
  },

  gradePosted: {
    subject: "Grade Posted for {{assignmentName}}",
    html: `
      <h2>Grade Posted</h2>
      <p>Hi {{userName}},</p>
      <p>Your grade for "{{assignmentName}}" in {{courseName}} has been posted.</p>
      <p>Grade: {{grade}}</p>
      <p><a href="{{gradeUrl}}">View Feedback</a></p>
    `,
    text: `
Grade Posted

Hi {{userName}},

Your grade for "{{assignmentName}}" in {{courseName}} has been posted.

Grade: {{grade}}

View Feedback: {{gradeUrl}}
    `,
  },

  liveSessionReminder: {
    subject: "Live Session Starting Soon: {{courseName}}",
    html: `
      <h2>Live Session Reminder</h2>
      <p>Hi {{userName}},</p>
      <p>Your live session for {{courseName}} starts in {{timeUntilStart}}.</p>
      <p>Session Details:</p>
      <ul>
        <li>Course: {{courseName}}</li>
        <li>Host: {{hostName}}</li>
        <li>Start Time: {{startTime}}</li>
      </ul>
      <p><a href="{{sessionUrl}}">Join Session</a></p>
    `,
    text: `
Live Session Reminder

Hi {{userName}},

Your live session for {{courseName}} starts in {{timeUntilStart}}.

Session Details:
- Course: {{courseName}}
- Host: {{hostName}}
- Start Time: {{startTime}}

Join Session: {{sessionUrl}}
    `,
  },

  courseProgress: {
    subject: "Course Progress Update: {{courseName}}",
    html: `
      <h2>Weekly Progress Update</h2>
      <p>Hi {{userName}},</p>
      <p>Here's your weekly progress update for {{courseName}}:</p>
      <ul>
        <li>Overall Progress: {{progress}}%</li>
        <li>Completed Modules: {{completedModules}}/{{totalModules}}</li>
        <li>Next Module: {{nextModule}}</li>
      </ul>
      <p><a href="{{courseUrl}}">Continue Learning</a></p>
    `,
    text: `
Weekly Progress Update

Hi {{userName}},

Here's your weekly progress update for {{courseName}}:
- Overall Progress: {{progress}}%
- Completed Modules: {{completedModules}}/{{totalModules}}
- Next Module: {{nextModule}}

Continue Learning: {{courseUrl}}
    `,
  },

  contentWarning: {
    subject: "Content Warning Notice",
    html: `
      <h2>Content Warning</h2>
      <p>Hi {{userName}},</p>
      <p>Your {{contentType}} has been flagged for review due to the following reason:</p>
      <p>{{warningReason}}</p>
      <p>Please review our community guidelines and make necessary adjustments.</p>
      <p><a href="{{contentUrl}}">View Content</a></p>
    `,
    text: `
Content Warning

Hi {{userName}},

Your {{contentType}} has been flagged for review due to the following reason:
{{warningReason}}

Please review our community guidelines and make necessary adjustments.

View Content: {{contentUrl}}
    `,
  },
};

// Helper function to format dates consistently
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to format time until start
export function formatTimeUntil(startTime: Date): string {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? "s" : ""}`;
}