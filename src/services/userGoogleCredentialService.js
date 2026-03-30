import crypto from "crypto";
import { prisma } from "../libs/prisma.js";
import { createOAuthClientWithCredentials } from "../libs/google.js";

const GOOGLE_TOKEN_ENCRYPTION_KEY_ENV = "GOOGLE_TOKEN_ENCRYPTION_KEY";
const TOKEN_VALUE_SEPARATOR = ":";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const parseEncryptionKey = () => {
  const rawKey = process.env[GOOGLE_TOKEN_ENCRYPTION_KEY_ENV];

  if (!rawKey) {
    return null;
  }

  const trimmedRawKey = rawKey.trim();

  let keyBuffer = null;

  try {
    const maybeBase64Buffer = Buffer.from(trimmedRawKey, "base64");

    if (maybeBase64Buffer.length === 32) {
      keyBuffer = maybeBase64Buffer;
    }
  } catch {
    keyBuffer = null;
  }

  if (!keyBuffer) {
    const utf8Buffer = Buffer.from(trimmedRawKey, "utf8");

    if (utf8Buffer.length === 32) {
      keyBuffer = utf8Buffer;
    }
  }

  if (!keyBuffer) {
    throw new Error(
      `${GOOGLE_TOKEN_ENCRYPTION_KEY_ENV} must be exactly 32 bytes (utf8) or base64 encoded 32-byte key`,
    );
  }

  return keyBuffer;
};

const encryptGoogleTokenValue = (tokenValue) => {
  if (!tokenValue) {
    return null;
  }

  const key = parseEncryptionKey();

  if (!key) {
    throw new Error(
      `${GOOGLE_TOKEN_ENCRYPTION_KEY_ENV} is required to encrypt Google token values`,
    );
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    const encryptedPayload = Buffer.concat([
      cipher.update(tokenValue, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    const ivBase64 = iv.toString("base64");
    const encryptedPayloadBase64 = encryptedPayload.toString("base64");
    const authTagBase64 = authTag.toString("base64");

    return `${ivBase64}${TOKEN_VALUE_SEPARATOR}${encryptedPayloadBase64}${TOKEN_VALUE_SEPARATOR}${authTagBase64}`;
  } catch {
    throw new Error("Failed to encrypt Google token value");
  }
};

const decryptGoogleTokenValue = (encryptedTokenValue) => {
  if (!encryptedTokenValue) {
    return null;
  }

  const parts = encryptedTokenValue.split(TOKEN_VALUE_SEPARATOR);

  if (parts.length !== 3) {
    return encryptedTokenValue;
  }

  const key = parseEncryptionKey();

  if (!key) {
    throw new Error(
      `${GOOGLE_TOKEN_ENCRYPTION_KEY_ENV} is required to decrypt stored Google token values`,
    );
  }

  const [ivBase64, encryptedPayloadBase64, authTagBase64] = parts;

  try {
    const iv = Buffer.from(ivBase64, "base64");
    const encryptedPayload = Buffer.from(encryptedPayloadBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error("Invalid encrypted token format");
    }

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decryptedPayload = Buffer.concat([
      decipher.update(encryptedPayload),
      decipher.final(),
    ]);

    return decryptedPayload.toString("utf8");
  } catch {
    throw new Error("Failed to decrypt Google token value");
  }
};

const buildOAuthCredentials = (googleCredential) => {
  const refreshToken = decryptGoogleTokenValue(
    googleCredential.encryptedRefreshToken,
  );
  const accessToken = decryptGoogleTokenValue(
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

export const upsertUserGoogleCredential = async (userId, googleId, tokens, scope = null) => {
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
    throw new Error("Google refresh_token is required for first-time credential creation");
  }

  const encryptedRefreshToken = tokens.refresh_token
    ? encryptGoogleTokenValue(tokens.refresh_token)
    : existingCredential?.encryptedRefreshToken || null;
  const encryptedAccessToken = tokens.access_token
    ? encryptGoogleTokenValue(tokens.access_token)
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
