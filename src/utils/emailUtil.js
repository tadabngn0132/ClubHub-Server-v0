import { transporter } from "../configs/nodemailerConfig.js";
import dotenv from "dotenv";
dotenv.config();

const APP_NAME = "ClubHub";

const createMessage = ({ to, subject, text, html }) => ({
  from: process.env.GMAIL_ADDRESS,
  to,
  subject,
  text,
  html,
});

export const sendResetPasswordEmail = async (resetToken, email) => {
  // TODO: implement send reset password email logic
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${resetToken}`;

  const message = createMessage({
    to: email,
    subject: `Reset your password for ${APP_NAME}`,
    text: `Click the following link to reset your password: ${resetPasswordUrl}`,
    html: `<p>Click the following link to reset your password:</p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`,
  });

  await transporter.sendMail(message);
};

export const sendChangePasswordConfirmationEmail = async (email) => {
  const message = createMessage({
    to: email,
    subject: "Your password has been changed",
    text:
      "Your password has been successfully changed. If you did not initiate this change, please contact support immediately.",
    html:
      "<p>Your password has been successfully changed.</p><p>If you did not initiate this change, please contact support immediately.</p>",
  });

  await transporter.sendMail(message);
};

export const sendWelcomeEmail = async (email, name, password) => {
  const signInUrl = `${process.env.CLIENT_URL}/sign-in`;

  const message = createMessage({
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    text: `Hello ${name},\n\nWelcome to ${APP_NAME}! We're excited to have you on board.`,
    html: `<p>Hello ${name},</p><p>Welcome to ${APP_NAME}! We're excited to have you on board.</p><br/><p>Email: ${email}</p><p>Password: ${password}</p><a href="${signInUrl}">Sign In Now</a><br/><p>Please change your password after your first login.</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendEventRegistrationConfirmationEmail = async (
  email,
  name,
  eventName,
) => {
  const message = createMessage({
    to: email,
    subject: `Registration Confirmation for ${eventName}`,
    text: `Hello ${name},\n\nYou have successfully registered for the event: ${eventName}. We look forward to seeing you there!`,
    html: `<p>Hello ${name},</p><p>You have successfully registered for the event: <strong>${eventName}</strong>. We look forward to seeing you there!</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendTaskDeadlineReminderEmail = async (
  email,
  name,
  taskTitle,
  deadline,
) => {
  const message = createMessage({
    to: email,
    subject: `Reminder: Upcoming Deadline for Task "${taskTitle}"`,
    text: `Hello ${name},\n\nThis is a friendly reminder that the deadline for your task "${taskTitle}" is approaching on ${deadline}. Please make sure to complete it on time.`,
    html: `<p>Hello ${name},</p><p>This is a friendly reminder that the deadline for your task <strong>"${taskTitle}"</strong> is approaching on <strong>${deadline}</strong>. Please make sure to complete it on time.</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendTaskAssignmentEmail = async (
  email,
  name,
  taskTitle,
  assignedBy,
) => {
  const message = createMessage({
    to: email,
    subject: `New Task Assigned: "${taskTitle}"`,
    text: `Hello ${name},\n\nYou have been assigned a new task titled "${taskTitle}" by ${assignedBy}. Please check your task list for more details and complete it by the deadline.`,
    html: `<p>Hello ${name},</p><p>You have been assigned a new task titled <strong>"${taskTitle}"</strong> by <strong>${assignedBy}</strong>. Please check your task list for more details and complete it by the deadline.</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendTaskUpdatedEmail = async (
  email,
  name,
  taskTitle,
  updatedBy,
) => {
  const message = createMessage({
    to: email,
    subject: `Task Updated: "${taskTitle}"`,
    text: `Hello ${name},\n\nYour task "${taskTitle}" has been updated by ${updatedBy}. Please review the latest details in the system.`,
    html: `<p>Hello ${name},</p><p>Your task <strong>"${taskTitle}"</strong> has been updated by <strong>${updatedBy}</strong>. Please review the latest details in the system.</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendTaskCancelledEmail = async (email, name, taskTitle) => {
  const message = createMessage({
    to: email,
    subject: `Task Cancelled: "${taskTitle}"`,
    text: `Hello ${name},\n\nThe task "${taskTitle}" has been cancelled. No further action is required.`,
    html: `<p>Hello ${name},</p><p>The task <strong>"${taskTitle}"</strong> has been cancelled. No further action is required.</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendTaskCompletionReviewEmail = async (
  email,
  name,
  taskTitle,
  isVerified,
  reviewerComments,
) => {
  const statusText = isVerified ? "approved" : "requires revision";
  const commentsText = reviewerComments
    ? `Reviewer comments: ${reviewerComments}`
    : "No additional reviewer comments.";

  const message = createMessage({
    to: email,
    subject: `Task Submission ${isVerified ? "Approved" : "Needs Revision"}: "${taskTitle}"`,
    text: `Hello ${name},\n\nYour task submission for "${taskTitle}" was ${statusText}. ${commentsText}`,
    html: `<p>Hello ${name},</p><p>Your task submission for <strong>"${taskTitle}"</strong> was <strong>${statusText}</strong>.</p><p>${commentsText}</p><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendAccountUnlockedEmail = async (email, name) => {
  const signInUrl = `${process.env.CLIENT_URL}/sign-in`;

  const message = createMessage({
    to: email,
    subject: "Your account has been unlocked",
    text: `Hello ${name},\n\nYour account has been unlocked. You can sign in again at ${signInUrl}.`,
    html: `<p>Hello ${name},</p><p>Your account has been unlocked. You can sign in again using the link below:</p><a href="${signInUrl}">Sign In</a><br/><br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendApplicationReviewResultEmail = async (
  email,
  name,
  stage,
  status,
  comment,
) => {
  const normalizedStage = String(stage || "application").toUpperCase();
  const normalizedStatus = String(status || "PENDING").toUpperCase();
  const commentLine = comment ? `Comment: ${comment}` : "";

  const message = createMessage({
    to: email,
    subject: `${normalizedStage} Review Result: ${normalizedStatus}`,
    text: `Hello ${name},\n\nYour ${normalizedStage} review result is: ${normalizedStatus}. ${commentLine}`,
    html: `<p>Hello ${name},</p><p>Your <strong>${normalizedStage}</strong> review result is: <strong>${normalizedStatus}</strong>.</p>${comment ? `<p>Comment: ${comment}</p>` : ""}<br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};

export const sendDepartmentInterviewResultEmail = async (
  email,
  name,
  departmentName,
  status,
  comment,
) => {
  const normalizedStatus = String(status || "PENDING").toUpperCase();

  const message = createMessage({
    to: email,
    subject: `Interview Result - ${departmentName}: ${normalizedStatus}`,
    text: `Hello ${name},\n\nYour interview status for department ${departmentName} is now ${normalizedStatus}.${comment ? ` Comment: ${comment}` : ""}`,
    html: `<p>Hello ${name},</p><p>Your interview status for department <strong>${departmentName}</strong> is now <strong>${normalizedStatus}</strong>.</p>${comment ? `<p>Comment: ${comment}</p>` : ""}<br/><p>Best regards,<br/>${APP_NAME}</p>`,
  });

  await transporter.sendMail(message);
};
