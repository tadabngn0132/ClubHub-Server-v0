# Google OAuth Refactor Checklist

## 1) Data model and migration
- [x] Create model `UserGoogleCredential` (1-1 with `User`, `userId` unique).
- [x] Add fields: `googleSub`, `encryptedRefreshToken`, `encryptedAccessToken`, `tokenType`, `scope`, `expiryDate`, `revokedAt`, `createdAt`, `updatedAt`.
- [x] Add reverse relation from `User` to `UserGoogleCredential`.
- [x] Create Prisma migration and apply to dev database.

## 2) Refactor Google auth library
- [ ] Keep scopes/config in `src/libs/google.js`.
- [ ] Remove shared mutable OAuth credentials pattern (no global client that is reused across users).
- [ ] Add factory helpers, for example: `createOAuthClient()` and `createOAuthClientWithCredentials(credentials)`.

## 3) Create per-user Google credential service
- [ ] Create service to load Google credentials by `userId` from DB.
- [ ] Decrypt token values before setting credentials on OAuth client.
- [ ] Return a fresh OAuth client for the target user.
- [ ] Handle edge cases: no credential, revoked credential, missing refresh token.

## 4) Update Google login callback flow
- [ ] In `googleAuthCallback`, create a local OAuth client instance.
- [ ] Use local client for `getToken` and `userinfo`.
- [ ] Upsert `UserGoogleCredential` after user is identified.
- [ ] If Google does not return a new `refresh_token`, keep the existing one in DB (do not overwrite with null).

## 5) Update Google API call sites (Drive/Calendar/Forms/...)
- [ ] For each API request, resolve current `userId`.
- [ ] Build a fresh OAuth client from stored credentials.
- [ ] Call Google APIs with that per-user client, not a shared global credentials client.

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
