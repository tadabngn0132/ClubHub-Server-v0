import { transporter } from '../configs/nodeMailerConfig.js'
import dotenv from 'dotenv'
dotenv.config()

const message = {
  from: process.env.GMAIL_ADDRESS,
  to: '',
  subject: '',
  text: '',
  html: ''
}

export const sendResetPasswordEmail = async (resetToken, email) => {
  // TODO: implement send reset password email logic
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${resetToken}`

  message.to = email
  message.subject = 'Reset your password for GDC Website'
  message.text = `Click the following link to reset your password: ${resetPasswordUrl}`
  message.html = `<p>Click the following link to reset your password:</p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`

  await transporter.sendMail(message)
}

export const sendChangePasswordConfirmationEmail = async (email) => {
  message.to = email
  message.subject = 'Your password has been changed'
  message.text = 'Your password has been successfully changed. If you did not initiate this change, please contact support immediately.'
  message.html = '<p>Your password has been successfully changed.</p><p>If you did not initiate this change, please contact support immediately.</p>'

  await transporter.sendMail(message)
}