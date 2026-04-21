# Server Potential Issues Review

Date: 2026-04-21
Scope: ClubHub-Server-v0

## Critical

### 1) Google credential write fields are inconsistent with Prisma model
- File: `src/controllers/authController.js`
- Evidence: uses `accessToken` and `refreshToken` when creating `userGoogleCredential`.
- Risk: runtime Prisma validation error or inconsistent credential storage.
- Why: project service layer stores encrypted tokens (`encryptedAccessToken`, `encryptedRefreshToken`) in `src/services/userGoogleCredentialService.js`.
- Suggested fix:
  - Stop writing raw `accessToken`/`refreshToken` directly in controller.
  - Use `upsertUserGoogleCredential(...)` only, or write correct encrypted fields.

### 2) Wrong Prisma API usage when creating department applications
- File: `src/controllers/memberApplicationController.js`
- Evidence: `tx.departmentMemberApplication.create({ data: applicationData.departmentIds.map(...) })`.
- Risk: create with array data can fail at runtime.
- Why: array payload should use `createMany`, not `create`.
- Suggested fix:
  - Replace with `createMany({ data: [...] })`.

### 3) Final review flow can create user even when final status is FAILED
- File: `src/controllers/memberApplicationController.js`
- Evidence: `createUserWithPositionsService(...)` runs before deciding and persisting final status result.
- Risk: rejected applicant can still get an internal account.
- Suggested fix:
  - Only create user when `finalReviewData.status` is PASSED.
  - Keep FAILED flow as review-only, no user creation and no welcome email.

## High

### 4) Potential data overexposure from `interviewer: true`
- File: `src/controllers/departmentApplicationController.js`
- Evidence: list/get endpoints include full interviewer record.
- Risk: unnecessary sensitive fields may be returned (depending on schema expansion).
- Suggested fix:
  - Replace with strict `select` for safe fields: `id`, `email`, `fullname`.

### 5) Password reset side-effect during Google account linking
- File: `src/controllers/authController.js`
- Evidence: sets `hashedPassword: await hashedDefaultPassword()` during Google callback linking.
- Risk: silently changes local password and weakens account control.
- Suggested fix:
  - Do not overwrite existing local password in OAuth linking flow.

## Medium

### 6) Google avatar field may be wrong (`avatar_url`)
- File: `src/controllers/authController.js`
- Evidence: reads `userInfo.avatar_url`.
- Risk: avatar update may silently fail because Google userinfo commonly returns `picture`.
- Suggested fix:
  - Use `userInfo.picture` (or fallback chain) and keep Cloudinary-first policy.

### 7) Server imports frontend Redux store
- File: `src/controllers/authController.js`
- Evidence: `import store from "../../../ClubHub-v0/src/store/index.js"`.
- Risk: backend/frontend coupling, brittle deploy/build, dead code.
- Suggested fix:
  - Remove import if unused.

### 8) Soft-deleted department applications are not filtered in list/get
- File: `src/controllers/departmentApplicationController.js`
- Evidence: queries do not add `isDeleted: false`.
- Risk: stale/deleted data appears in APIs.
- Suggested fix:
  - Add `where: { isDeleted: false }` for list/detail endpoints where appropriate.

## Notes
- Workspace diagnostics currently report no syntax/type errors.
- Findings above are behavioral and data-safety risks from code inspection.

## Recommended Fix Order
1. Critical #1, #2, #3
2. High #4, #5
3. Medium #6, #7, #8
