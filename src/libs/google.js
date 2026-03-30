import { google } from "googleapis";

export const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL,
  );
};

export const createOAuthClientWithCredentials = (credentials = {}) => {
  const oauthClient = createOAuthClient();
  oauthClient.setCredentials(credentials);
  return oauthClient;
};

export const scopes = {
  // Google OAuth 2.0
  userInfoProfile: "https://www.googleapis.com/auth/userinfo.profile",
  userInfoEmail: "https://www.googleapis.com/auth/userinfo.email",

  // Google Drive
  drive: "https://www.googleapis.com/auth/drive",
  driveFile: "https://www.googleapis.com/auth/drive.file",
  driveReadonly: "https://www.googleapis.com/auth/drive.readonly",

  // Google Forms
  formsBody: "https://www.googleapis.com/auth/forms.body",
  formsBodyReadonly: "https://www.googleapis.com/auth/forms.body.readonly",
  formsResponsesReadonly:
    "https://www.googleapis.com/auth/forms.responses.readonly",

  // Google Meet
  meetingsSpaceCreated:
    "https://www.googleapis.com/auth/meetings.space.created",
  meetingsSpaceReadonly:
    "https://www.googleapis.com/auth/meetings.space.readonly",
  meetingsSpaceSettings:
    "https://www.googleapis.com/auth/meetings.space.settings",

  // Google Calendar
  calendar: "https://www.googleapis.com/auth/calendar",
  calendarEvents: "https://www.googleapis.com/auth/calendar.events",
  calendarReadonly: "https://www.googleapis.com/auth/calendar.readonly",
};

export const roleBasedScopes = {
  admin: [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.drive,
    scopes.calendar,
    scopes.formsBody,
    scopes.formsResponsesReadonly,
    scopes.meetingsSpaceCreated,
    scopes.meetingsSpaceSettings,
  ],
  moderator: [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.driveFile,
    scopes.calendarEvents,
    scopes.formsResponsesReadonly,
    scopes.meetingsSpaceCreated,
  ],
  member: [
    scopes.userInfoProfile,
    scopes.userInfoEmail,
    scopes.driveReadonly,
    scopes.calendarReadonly,
  ],
};

export const createGoogleApis = (auth) => {
  return {
    googleDrive: google.drive({ version: "v3", auth }),
    googleDocs: google.docs({ version: "v1", auth }),
    googleSheets: google.sheets({
      version: "v4",
      auth,
    }),
    googleForms: google.forms({ version: "v1", auth }),
    googleCalendar: google.calendar({
      version: "v3",
      auth,
    }),
    googleMail: google.gmail({ version: "v1", auth }),
  };
};
