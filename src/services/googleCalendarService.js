import { withUserGoogleCalendar } from "./googleAuthContextService.js";

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

export const exportICSFile = async (userId, eventId, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.events.get({
      calendarId,
      eventId,
      fields: "id,summary,start,end,location,description",
    });
    const event = response.data;

    const icsContent = `BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:-//ClubHub//Google Calendar Export//EN
      BEGIN:VEVENT
      UID:${event.id}@clubhub
      SUMMARY:${event.summary}
      DTSTART:${formatDateToICS(event.start.dateTime)}
      DTEND:${formatDateToICS(event.end.dateTime)}
      LOCATION:${event.location || ""}
      DESCRIPTION:${event.description || ""}
      END:VEVENT
      END:VCALENDAR`;
    return icsContent;
  });
};
