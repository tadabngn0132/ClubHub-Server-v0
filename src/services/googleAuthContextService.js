import { createGoogleApis } from "../libs/google.js";
import { getUserGoogleOAuthContext } from "./userGoogleCredentialService.js";

export const withUserGoogleAuth = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis, oauthClient);
};

export const withUserGoogleCalendar = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis.googleCalendar);
};

export const withUserGoogleDrive = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis.googleDrive);
};

export const withUserGoogleForms = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis.googleForms);
};

export const withUserGoogleSheets = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis.googleSheets);
};

export const withUserGoogleDocs = async (userId, handler) => {
  const { oauthClient } = await getUserGoogleOAuthContext(userId);
  const apis = createGoogleApis(oauthClient);
  return handler(apis.googleDocs);
};
