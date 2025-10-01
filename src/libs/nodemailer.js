import nodemailer from 'nodemailer'

// App Password

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GOOGLE_APP_PASSWORD
  }
})

// OAuth 2.0 (Implement later)

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: "me@gmail.com",
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//   },
// });

export let messageTemplate = {
  from: "Nodemailer <example@nodemailer.com>",
  to: "Nodemailer <example@nodemailer.com>",
  subject: "AMP4EMAIL message",
  text: "For clients with plaintext support only",
  html: "<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>",
  amp: `<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
      </head>
      <body>
        <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
        <p>GIF (requires "amp-anim" script in header):<br/>
          <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
      </body>
    </html>`,
  attachments: [
    {
      filename: 'logo.png',
      path: '.assets/logo.png',
      cid: 'logo@nodemailer'
    }
  ]
}