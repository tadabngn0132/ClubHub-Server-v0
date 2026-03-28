export const createOAuth2Client = (google) => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL,
  );
}

export const createOAuth2ClientWithCredentials = (google, credentials) => {
  const oauth2Client = createOAuth2Client(google);
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
}