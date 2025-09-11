import { google } from 'googleapis'

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
)

const scopes = {
  // Google OAuth 2.0
  userInfoProfile: 'https://www.googleapis.com/auth/userinfo.profile',
  userInfoEmail: 'https://www.googleapis.com/auth/userinfo.email',

  // Google Drive
  drive: 'https://www.googleapis.com/auth/drive',
  driveFile: 'https://www.googleapis.com/auth/drive.file',
  driveReadonly: 'https://www.googleapis.com/auth/drive.readonly',

  // Google Forms
  formsBody: 'https://www.googleapis.com/auth/forms.body',
  formsBodyReadonly: 'https://www.googleapis.com/auth/forms.body.readonly',
  formsResponsesReadonly: 'https://www.googleapis.com/auth/forms.responses.readonly',

  // Google Meet
  meetingsSpaceCreated: 'https://www.googleapis.com/auth/meetings.space.created',
  meetingsSpaceReadonly: 'https://www.googleapis.com/auth/meetings.space.readonly',
  meetingsSpaceSettings: 'https://www.googleapis.com/auth/meetings.space.settings',

  // Google Calendar
  calendar: 'https://www.googleapis.com/auth/calendar',
  calendarEvents: 'https://www.googleapis.com/auth/calendar.events',
  calendarReadonly: 'https://www.googleapis.com/auth/calendar.readonly'
}

export const roleBasedScopes = {
  admin : [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.drive,
    scopes.calendar,
    scopes.formsBody,
    scopes.formsResponsesReadonly,
    scopes.meetingsSpaceCreated,
    scopes.meetingsSpaceSettings
  ],
  moderator: [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.driveFile,
    scopes.calendarEvents,
    scopes.formsResponsesReadonly,
    scopes.meetingsSpaceCreated
  ],
  member: [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.driveReadonly,
    scopes.calendarReadonly
  ]
}