import { withUserGoogleCalendar } from "./googleAuthContextService.js";

export const listUserCalendarEvents = async (
  userId,
  calendarId = "primary",
  timeMin = null,
  timeMax = null,
  maxResults = 50,
) => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const params = {
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
      maxResults,
      fields: "items(id,summary,description,start,end,location)",
    };

    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;

    const response = await googleCalendar.events.list(params);
    return response.data.items ?? [];
  });
};

export const getUserCalendarEvent = async (userId, eventId, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.events.get({
      calendarId,
      eventId,
      fields: "id,summary,description,start,end,location,attendees,conferenceData",
    });

    return response.data;
  });
};

export const findUserCalendarEventByActivityId = async (
  userId,
  activityId,
  calendarId = "primary",
) => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.events.list({
      calendarId,
      privateExtendedProperty: `activityId=${String(activityId)}`,
      singleEvents: true,
      maxResults: 1,
      fields: "items(id,summary,start,end,extendedProperties)",
    });

    return response.data.items?.[0] ?? null;
  });
};

export const createUserCalendarEvent = async (userId, eventData, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const shouldCreateGoogleMeet = eventData.createGoogleMeet !== false;
    const requestBody = {
      summary: eventData.summary,
      description: eventData.description || "",
      location: eventData.location || "",
      start: { dateTime: eventData.startDateTime, timeZone: eventData.timeZone || "UTC" },
      end: { dateTime: eventData.endDateTime, timeZone: eventData.timeZone || "UTC" },
    };

    if (eventData.attendees && Array.isArray(eventData.attendees)) {
      requestBody.attendees = eventData.attendees;
    }

    if (eventData.reminders) {
      requestBody.reminders = eventData.reminders;
    }

    if (eventData.extendedProperties) {
      requestBody.extendedProperties = eventData.extendedProperties;
    }

    if (shouldCreateGoogleMeet) {
      requestBody.conferenceData = {
        createRequest: {
          requestId: `clubhub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      };
    }

    const response = await googleCalendar.events.insert({
      calendarId,
      requestBody,
      conferenceDataVersion: shouldCreateGoogleMeet ? 1 : 0,
      fields: "id,summary,start,end,webLink,hangoutLink,conferenceData",
    });

    return response.data;
  });
};

export const updateUserCalendarEvent = async (
  userId,
  eventId,
  updates,
  calendarId = "primary",
) => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const requestBody = {};

    if (updates.summary) requestBody.summary = updates.summary;
    if (updates.description) requestBody.description = updates.description;
    if (updates.location) requestBody.location = updates.location;

    if (updates.startDateTime) {
      requestBody.start = {
        dateTime: updates.startDateTime,
        timeZone: updates.timeZone || "UTC",
      };
    }

    if (updates.endDateTime) {
      requestBody.end = { dateTime: updates.endDateTime, timeZone: updates.timeZone || "UTC" };
    }

    if (updates.attendees) {
      requestBody.attendees = updates.attendees;
    }

    const response = await googleCalendar.events.patch({
      calendarId,
      eventId,
      requestBody,
      fields: "id,summary,start,end,modifiedTime",
    });

    return response.data;
  });
};

export const deleteUserCalendarEvent = async (userId, eventId, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    await googleCalendar.events.delete({ calendarId, eventId });
    return { success: true };
  });
};

export const searchUserCalendarEvents = async (
  userId,
  searchTerm,
  calendarId = "primary",
) => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.events.list({
      calendarId,
      q: searchTerm,
      maxResults: 20,
      fields: "items(id,summary,start,end)",
    });

    return response.data.items ?? [];
  });
};

export const getUserCalendarList = async (userId) => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.calendarList.list({
      fields: "items(id,summary,description,primary,backgroundColor)",
    });

    return response.data.items ?? [];
  });
};
