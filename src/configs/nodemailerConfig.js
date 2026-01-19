import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GOOGLE_APP_PASSWORD
  }
})