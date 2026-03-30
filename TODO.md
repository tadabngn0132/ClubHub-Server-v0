# Google OAuth Refactor Checklist

## 1) Data model and migration
- [x] Create model `UserGoogleCredential` (1-1 with `User`, `userId` unique).
- [x] Add fields: `googleId`, `encryptedRefreshToken`, `encryptedAccessToken`, `tokenType`, `scope`, `expiryDate`, `revokedAt`, `createdAt`, `updatedAt`.
- [x] Add reverse relation from `User` to `UserGoogleCredential`.
- [x] Create Prisma migration and apply to dev database.

## 2) Refactor Google auth library
- [x] Keep scopes/config in `src/libs/google.js`.
- [x] Remove shared mutable OAuth credentials pattern (no global client that is reused across users).
- [x] Add factory helpers, for example: `createOAuthClient()` and `createOAuthClientWithCredentials(credentials)`.

## 3) Create per-user Google credential service
- [x] Create service to load Google credentials by `userId` from DB.
- [x] Decrypt token values before setting credentials on OAuth client.
- [x] Return a fresh OAuth client for the target user.
- [x] Handle edge cases: no credential, revoked credential, missing refresh token.

## 4) Update Google login callback flow
- [x] In `googleAuthCallback`, create a local OAuth client instance.
- [x] Use local client for `getToken` and `userinfo`.
- [x] Upsert `UserGoogleCredential` after user is identified.
- [x] If Google does not return a new `refresh_token`, keep the existing one in DB (do not overwrite with null).

## 5) Update Google API call sites (Drive/Calendar/Forms/...)
- [x] For each API request, resolve current `userId`.
- [x] Build a fresh OAuth client from stored credentials.
- [x] Call Google APIs with that per-user client, not a shared global credentials client.

## 6) Security requirements
- [ ] Never store user OAuth tokens in `.env`.
- [ ] Never log tokens to console/log files.
- [ ] Store token values encrypted at rest in DB.
- [ ] Add disconnect/revoke flow (`revokedAt` or delete credential record).

## 7) Testing checklist
- [ ] First-time Google login returns and stores refresh token correctly.
- [ ] Re-login without new refresh token keeps old refresh token.
- [ ] Concurrent requests from multiple users do not mix credentials.
- [ ] Revoked/disconnected credentials cannot call Google APIs.

## 8) Nice-to-have (optional)
- [ ] Add background job or lazy refresh policy for expired access tokens.
- [ ] Track granted scopes and validate scope before each Google feature call.
- [ ] Add audit logs for connect/disconnect Google account events (without logging token contents).
