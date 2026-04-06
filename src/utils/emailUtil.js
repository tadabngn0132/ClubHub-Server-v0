import { transporter } from "../configs/nodemailerConfig.js";
import dotenv from "dotenv";
dotenv.config();

const message = {
  from: process.env.GMAIL_ADDRESS,
  to: "",
  subject: "",
  text: "",
  html: "",
};

export const sendResetPasswordEmail = async (resetToken, email) => {
  // TODO: implement send reset password email logic
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${resetToken}`;

  message.to = email;
  message.subject = "Reset your password for GDC Website";
  message.text = `Click the following link to reset your password: ${resetPasswordUrl}`;
  message.html = `<p>Click the following link to reset your password:</p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`;

  await transporter.sendMail(message);
};

export const sendChangePasswordConfirmationEmail = async (email) => {
  message.to = email;
  message.subject = "Your password has been changed";
  message.text =
    "Your password has been successfully changed. If you did not initiate this change, please contact support immediately.";
  message.html =
    "<p>Your password has been successfully changed.</p><p>If you did not initiate this change, please contact support immediately.</p>";

  await transporter.sendMail(message);
};

export const sendWelcomeEmail = async (email, name, password) => {
  const signInUrl = `${process.env.CLIENT_URL}/sign-in`;

  message.to = email;
  message.subject = "Welcome to GDC Website!";
  message.text = `Hello ${name},\n\nWelcome to the GDC Website! We're excited to have you on board.`;
  message.html = `<p>Hello ${name},</p><p>Welcome to the GDC Website! We're excited to have you on board.</p><br/><p>Email: ${email}</p><p>Password: ${password}</p><a href="${signInUrl}">Sign In Now</a><br/><p>Please change your password after your first login.</p><br/><p>Best regards,<br/>GDC - Greenwich Dance Crew</p>`;

  await transporter.sendMail(message);
};

export const sendEventRegistrationConfirmationEmail = async (
  email,
  name,
  eventName,
) => {
  message.to = email;
  message.subject = `Registration Confirmation for ${eventName}`;
  message.text = `Hello ${name},\n\nYou have successfully registered for the event: ${eventName}. We look forward to seeing you there!`;
  message.html = `<p>Hello ${name},</p><p>You have successfully registered for the event: <strong>${eventName}</strong>. We look forward to seeing you there!</p><br/><p>Best regards,<br/>GDC - Greenwich Dance Crew</p>`;

  await transporter.sendMail(message);
};

export const sendTaskDeadlineReminderEmail = async (
  email,
  name,
  taskTitle,
  deadline,
) => {
  message.to = email;
  message.subject = `Reminder: Upcoming Deadline for Task "${taskTitle}"`;
  message.text = `Hello ${name},\n\nThis is a friendly reminder that the deadline for your task "${taskTitle}" is approaching on ${deadline}. Please make sure to complete it on time.`;
  message.html = `<p>Hello ${name},</p><p>This is a friendly reminder that the deadline for your task <strong>"${taskTitle}"</strong> is approaching on <strong>${deadline}</strong>. Please make sure to complete it on time.</p><br/><p>Best regards,<br/>GDC - Greenwich Dance Crew</p>`;

  await transporter.sendMail(message);
};

export const sendTaskAssignmentEmail = async (
  email,
  name,
  taskTitle,
  assignedBy,
) => {
  message.to = email;
  message.subject = `New Task Assigned: "${taskTitle}"`;
  message.text = `Hello ${name},\n\nYou have been assigned a new task titled "${taskTitle}" by ${assignedBy}. Please check your task list for more details and complete it by the deadline.`;
  message.html = `<p>Hello ${name},</p><p>You have been assigned a new task titled <strong>"${taskTitle}"</strong> by <strong>${assignedBy}</strong>. Please check your task list for more details and complete it by the deadline.</p><br/><p>Best regards,<br/>GDC - Greenwich Dance Crew</p>`;

  await transporter.sendMail(message);
};
