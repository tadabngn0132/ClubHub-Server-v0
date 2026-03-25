# Huong dan dung Google API theo CRUD (cho ClubHub)

Tai lieu nay huong dan cach dung Google API theo mo hinh CRUD trong backend hien tai (Node.js + Express + Prisma + googleapis).

## 1) Muc tieu va pham vi

- OAuth da co san:
	- `GET /api/auth/google-auth`
	- `GET /api/auth/google-auth/callback`
- Google client da co san trong `src/libs/google.js`:
	- `googleDrive`, `googleCalendar`, `googleForms`, `googleSheets`, `googleDocs`, `googleMail`
- Role scopes da khai bao trong `roleBasedScopes` (admin/moderator/member)

Muc tieu tiep theo la dung cac client tren de implement CRUD cho resource Google (event, file, form...).

## 2) Dieu kien tien quyet

### 2.1 Google Cloud

- Tao OAuth Client (Web application)
- Them redirect URI trung voi backend callback
- Enable cac API can dung (Calendar API, Drive API, Forms API...)
- OAuth Consent Screen da set test users hoac da verify (neu scope nhay cam)

### 2.2 Env can co

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URL`
- `CLIENT_URL`

### 2.3 Luu y quan trong ve token

Code hien tai da auth duoc Google user, nhung chua luu vung refresh token Google trong DB de goi Google API lau dai theo user.

De CRUD on dinh, ban nen co them noi luu:

- `googleAccessToken`
- `googleRefreshToken` (nen ma hoa)
- `googleTokenExpiryDate`
- `googleGrantedScopes`

Neu khong luu refresh token, API se fail sau khi access token het han.

## 3) Kien truc de implement CRUD dung cach

Nen tach 3 lop:

1. `GoogleTokenService`: lay/refresh token cho tung user
2. `Google<Domain>Service`: service cho Drive/Calendar/Forms
3. `Controller`: validate input + tra response REST

Flow moi request CRUD:

1. Xac dinh user dang login
2. Lay token Google cua user
3. `oauth2Client.setCredentials(...)`
4. Goi Google API client (`googleDrive`, `googleCalendar`, ...)
5. Xu ly loi theo ma (`401`, `403`, `404`, `429`, `5xx`)

## 4) Mau helper dung chung

Tao helper de khong lap lai code set credentials.

```js
// src/services/google/googleAuthContextService.js
import { oauth2Client } from "../../libs/google.js";

export async function withGoogleAuth(userGoogleToken, handler) {
	oauth2Client.setCredentials({
		access_token: userGoogleToken.accessToken,
		refresh_token: userGoogleToken.refreshToken,
		expiry_date: userGoogleToken.expiryDate,
	});

	return handler();
}
```

## 5) CRUD voi Google Calendar Events

Resource: `events`

### 5.1 Create

```js
import { googleCalendar } from "../../libs/google.js";
import { withGoogleAuth } from "./googleAuthContextService.js";

export async function createCalendarEvent(userGoogleToken, payload) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleCalendar.events.insert({
			calendarId: "primary",
			requestBody: {
				summary: payload.summary,
				description: payload.description,
				start: { dateTime: payload.startDateTime },
				end: { dateTime: payload.endDateTime },
				location: payload.location,
			},
		});

		return response.data;
	});
}
```

### 5.2 Read

```js
export async function listCalendarEvents(userGoogleToken, timeMin, timeMax) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleCalendar.events.list({
			calendarId: "primary",
			timeMin,
			timeMax,
			singleEvents: true,
			orderBy: "startTime",
			maxResults: 50,
		});

		return response.data.items ?? [];
	});
}

export async function getCalendarEventById(userGoogleToken, eventId) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleCalendar.events.get({
			calendarId: "primary",
			eventId,
		});

		return response.data;
	});
}
```

### 5.3 Update

```js
export async function updateCalendarEvent(userGoogleToken, eventId, payload) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleCalendar.events.patch({
			calendarId: "primary",
			eventId,
			requestBody: {
				summary: payload.summary,
				description: payload.description,
				start: { dateTime: payload.startDateTime },
				end: { dateTime: payload.endDateTime },
			},
		});

		return response.data;
	});
}
```

### 5.4 Delete

```js
export async function deleteCalendarEvent(userGoogleToken, eventId) {
	return withGoogleAuth(userGoogleToken, async () => {
		await googleCalendar.events.delete({
			calendarId: "primary",
			eventId,
		});

		return { deleted: true };
	});
}
```

## 6) CRUD voi Google Drive Files

Resource: `files`

### 6.1 Create (upload)

```js
import { googleDrive } from "../../libs/google.js";

export async function uploadDriveFile(userGoogleToken, metadata, media) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleDrive.files.create({
			requestBody: {
				name: metadata.name,
				parents: metadata.parents,
			},
			media,
			fields: "id,name,mimeType,webViewLink,webContentLink",
		});

		return response.data;
	});
}
```

### 6.2 Read

```js
export async function listDriveFiles(userGoogleToken, query = "trashed = false") {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleDrive.files.list({
			q: query,
			pageSize: 50,
			fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
		});

		return response.data.files ?? [];
	});
}

export async function getDriveFile(userGoogleToken, fileId) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleDrive.files.get({
			fileId,
			fields: "id,name,mimeType,size,webViewLink,parents",
		});

		return response.data;
	});
}
```

### 6.3 Update

```js
export async function updateDriveFileMeta(userGoogleToken, fileId, payload) {
	return withGoogleAuth(userGoogleToken, async () => {
		const response = await googleDrive.files.update({
			fileId,
			requestBody: {
				name: payload.name,
			},
			fields: "id,name,mimeType,modifiedTime",
		});

		return response.data;
	});
}
```

### 6.4 Delete

```js
export async function deleteDriveFile(userGoogleToken, fileId) {
	return withGoogleAuth(userGoogleToken, async () => {
		await googleDrive.files.delete({ fileId });
		return { deleted: true };
	});
}
```

## 7) CRUD voi Google Forms (luu y gioi han)

Forms API khong CRUD day du nhu Drive/Calendar:

- Create: `forms.create`
- Read: `forms.get`, `forms.responses.list`
- Update: `forms.batchUpdate`
- Delete: khong co endpoint xoa truc tiep trong Forms API

Neu can "Delete form", thuong xu ly bang Google Drive API (`files.delete`) voi file form do.

## 8) Mapping REST endpoint trong ClubHub (goi y)

Ban co the expose endpoint noi bo nhu sau:

- `POST /api/google/calendar/events`
- `GET /api/google/calendar/events`
- `GET /api/google/calendar/events/:eventId`
- `PATCH /api/google/calendar/events/:eventId`
- `DELETE /api/google/calendar/events/:eventId`
- `POST /api/google/drive/files`
- `GET /api/google/drive/files`
- `GET /api/google/drive/files/:fileId`
- `PATCH /api/google/drive/files/:fileId`
- `DELETE /api/google/drive/files/:fileId`

## 9) Error handling can co

Can map loi Google -> loi API cua ban:

- `401 invalid_grant`: refresh token het han/bi revoke -> yeu cau user connect lai Google
- `403 insufficientPermissions`: scope khong du -> yeu cau auth lai voi scope moi
- `404 notFound`: resource khong ton tai hoac user khong co quyen
- `429 rateLimitExceeded`: retry voi exponential backoff
- `5xx`: retry toi da 2-3 lan

## 10) Kiem thu CRUD

Case can test cho moi API:

- Tao resource thanh cong
- Lay danh sach va lay chi tiet
- Cap nhat thanh cong
- Xoa thanh cong
- Token het han -> refresh token thanh cong
- Refresh token revoke -> user can reconnect
- Scope thieu -> tra loi 403 de frontend show huong dan

## 11) Checklist trien khai nhanh (MVP)

- [ ] Hoan thien luu Google refresh token theo user
- [ ] Lam CRUD Calendar Events day du
- [ ] Lam CRUD Drive Files day du
- [ ] Them retry + error mapper
- [ ] Viet Postman collection cho toan bo endpoint CRUD

## 12) Ghi chu theo codebase hien tai

- OAuth routes dang nam o `src/routes/authRoute.js`
- OAuth callback logic dang nam o `src/controllers/authController.js`
- Google clients/scopes dang nam o `src/libs/google.js`

Ban co the bat dau bang Calendar Events truoc, vi no sat voi feature Activities trong he thong.
