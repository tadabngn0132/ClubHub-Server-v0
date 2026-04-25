import { prisma } from "../libs/prisma.js";
import { createOAuthClientWithCredentials } from "../libs/google.js";
const TOKEN_VALUE_SEPARATOR = ":";

const isLegacyEncryptedTokenFormat = (tokenValue) => {
  if (typeof tokenValue !== "string") {
    return false;
  }

  const parts = tokenValue.split(TOKEN_VALUE_SEPARATOR);
  return parts.length === 3;
};

const toStorableGoogleTokenValue = (tokenValue) => {
  if (!tokenValue) {
    return null;
  }

  // Simple mode: store token as plain text to keep implementation easy.
  return String(tokenValue);
};

const fromStoredGoogleTokenValue = (tokenValue) => {
  if (!tokenValue) {
    return null;
  }

  // Old data may still be AES-encrypted from previous versions.
  // We no longer decrypt by design, so ask user to login with Google again.
  if (isLegacyEncryptedTokenFormat(tokenValue)) {
    throw new Error(
      "Google credential is using legacy encrypted format. Please login with Google again to refresh tokens.",
    );
  }

  return tokenValue;
};

const buildOAuthCredentials = (googleCredential) => {
  const refreshToken = fromStoredGoogleTokenValue(
    googleCredential.encryptedRefreshToken,
  );
  const accessToken = fromStoredGoogleTokenValue(
    googleCredential.encryptedAccessToken,
  );

  if (!refreshToken) {
    throw new Error("Google credential is missing refresh token");
  }

  return {
    refresh_token: refreshToken,
    access_token: accessToken ?? undefined,
    token_type: googleCredential.tokenType ?? undefined,
    scope: googleCredential.scope ?? undefined,
    expiry_date: googleCredential.expiryDate
      ? new Date(googleCredential.expiryDate).getTime()
      : undefined,
  };
};

export const getUserGoogleCredentialByUserId = async (userId) => {
  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("Invalid userId for Google credential lookup");
  }

  const googleCredential = await prisma.userGoogleCredential.findUnique({
    where: {
      userId: normalizedUserId,
    },
  });

  if (!googleCredential) {
    throw new Error("Google credential not found for this user");
  }

  if (googleCredential.revokedAt) {
    throw new Error("Google credential has been revoked");
  }

  return googleCredential;
};

export const createUserGoogleOAuthClient = async (userId) => {
  const googleCredential = await getUserGoogleCredentialByUserId(userId);
  const credentials = buildOAuthCredentials(googleCredential);

  return createOAuthClientWithCredentials(credentials);
};

export const getUserGoogleOAuthContext = async (userId) => {
  const googleCredential = await getUserGoogleCredentialByUserId(userId);
  const credentials = buildOAuthCredentials(googleCredential);
  const oauthClient = createOAuthClientWithCredentials(credentials);

  return {
    googleCredential,
    credentials,
    oauthClient,
  };
};

export const upsertUserGoogleCredential = async (
  userId,
  googleId,
  tokens,
  scope = null,
) => {
  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("Invalid userId for Google credential upsert");
  }

  if (!googleId) {
    throw new Error("googleId is required");
  }

  if (!tokens) {
    throw new Error("Google tokens are required");
  }

  const existingCredential = await prisma.userGoogleCredential.findUnique({
    where: {
      userId: normalizedUserId,
    },
  });

  if (!tokens.refresh_token && !existingCredential) {
    throw new Error(
      "Google refresh_token is required for first-time credential creation",
    );
  }

  const encryptedRefreshToken = tokens.refresh_token
    ? toStorableGoogleTokenValue(tokens.refresh_token)
    : existingCredential?.encryptedRefreshToken || null;
  const encryptedAccessToken = tokens.access_token
    ? toStorableGoogleTokenValue(tokens.access_token)
    : existingCredential?.encryptedAccessToken || null;

  const expiryDate = tokens.expiry_date
    ? new Date(tokens.expiry_date)
    : existingCredential?.expiryDate || null;
  const tokenType = tokens.token_type || existingCredential?.tokenType || null;
  const scopeValue = scope || tokens.scope || existingCredential?.scope || null;

  if (existingCredential) {
    return prisma.userGoogleCredential.update({
      where: {
        userId: normalizedUserId,
      },
      data: {
        googleId,
        encryptedRefreshToken: encryptedRefreshToken,
        encryptedAccessToken: encryptedAccessToken,
        tokenType,
        scope: scopeValue,
        expiryDate,
        revokedAt: null,
      },
    });
  } else {
    return prisma.userGoogleCredential.create({
      data: {
        userId: normalizedUserId,
        googleId,
        encryptedRefreshToken: encryptedRefreshToken,
        encryptedAccessToken: encryptedAccessToken,
        tokenType,
        scope: scopeValue,
        expiryDate,
      },
    });
  }
};
