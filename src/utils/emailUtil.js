import { transporter } from '../configs/nodeMailerConfig.js'
import dotenv from 'dotenv'
dotenv.config()

const message = {
  from: process.env.GMAIL_ADDRESS,
  to: '',
  subject: 'Reset your password for GDC Website',
  text: '',
  html: ''
}

export const sendResetPasswordEmail = async (resetToken, email) => {
  // TODO: implement send reset password email logic
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${resetToken}`

  message.to = email
  message.text = `Click the following link to reset your password: ${resetPasswordUrl}`
  message.html = `<p>Click the following link to reset your password:</p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`

  await transporter.sendMail(message)
}