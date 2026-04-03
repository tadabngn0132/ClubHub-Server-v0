import { withUserGoogleCalendar } from "./googleAuthContextService.js";
import { v4 as uuidv4 } from "uuid";

export const createCalendarEventAndMeetingLink = async (userId, eventData, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const requestBody = {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      attendees: eventData.attendees,
      conferenceData: eventData.locationType === "online" || eventData.locationType === "hybrid" ? {
        createRequest: {
          requestId: `meet-${eventData.id}-${Date.now()}-${uuidv4()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      } : undefined,
    };

    const response = await googleCalendar.events.insert({
      calendarId,
      requestBody,
      conferenceDataVersion: eventData.locationType === "online" || eventData.locationType === "hybrid" ? 1 : undefined,
      fields: "id,summary,start,end,location,description,conferenceData",
    });

    return response.data;
  });
};

export const updateGoogleCalendarEvent = async (userId, eventId, updatedData, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const requestBody = {
      summary: updatedData.summary,
      description: updatedData.description,
      location: updatedData.location,
      start: {
        dateTime: updatedData.startDateTime,
        timeZone: updatedData.timeZone || "UTC",
      },
      end: {
        dateTime: updatedData.endDateTime,
        timeZone: updatedData.timeZone || "UTC",
      },
      attendees: updatedData.attendees,
      conferenceData: updatedData.locationType === "online" || updatedData.locationType === "hybrid" ? {
        createRequest: {
          requestId: `meet-${eventId}-${Date.now()}-${uuidv4()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      } : undefined,
    };

    const response = await googleCalendar.events.update({
      calendarId,
      eventId,
      requestBody,
      conferenceDataVersion: updatedData.locationType === "online" || updatedData.locationType === "hybrid" ? 1 : undefined,
      fields: "id,summary,start,end,location,description,conferenceData",
    });

    return response.data;
  });
};

export const deleteGoogleCalendarEvent = async (userId, eventId, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    await googleCalendar.events.delete({
      calendarId,
      eventId,
    });
    return { success: true };
  });
};

export const exportICSFile = async (userId, eventId, calendarId = "primary") => {
  return withUserGoogleCalendar(userId, async (googleCalendar) => {
    const response = await googleCalendar.events.get({
      calendarId,
      eventId,
      fields: "id,summary,start,end,location,description,conferenceData",
    });
    const event = response.data;
    
    const icsContent = `BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:-//ClubHub//Google Calendar Export//EN
      BEGIN:VEVENT
      UID:${event.id}
      SUMMARY:${event.summary}
      DESCRIPTION:${event.description}
      LOCATION:${event.location}
      DTSTART:${event.start.dateTime.replace(/[-:]/g, "")}
      DTEND:${event.end.dateTime.replace(/[-:]/g, "")}
      END:VEVENT
      END:VCALENDAR`;
    return icsContent;
  });
};
