import { prisma } from "../libs/prisma.js";
import { AppError, BadRequestError, NotFoundError } from "../utils/AppError.js";
import { addGuestToCalendarEvent } from "./googleCalendarService.js";
import { sendEventRegistrationConfirmationEmail } from "../utils/emailUtil.js";

export const registerActivityParticipation = async ({
  activity,
  userId = null,
  guestName = null,
  guestEmail = null,
  guestPhoneNumber = null,
  status,
}) => {
  const normalizedUserId = userId ? Number(userId) : null;

  let participantEmail = guestEmail || null;
  let participantName = guestName || null;

  if (normalizedUserId) {
    const user = await prisma.user.findUnique({
      where: { id: normalizedUserId },
      select: {
        email: true,
        fullname: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    participantEmail = user.email;
    participantName = user.fullname;
  }

  if (!participantEmail) {
    throw new BadRequestError("Participant email is required");
  }

  const existingParticipation = await prisma.activityParticipation.findFirst({
    where: {
      activityId: activity.id,
      OR: [
        ...(normalizedUserId ? [{ userId: normalizedUserId }] : []),
        { guestEmail: participantEmail },
        { user: { email: participantEmail } },
      ],
    },
  });

  if (existingParticipation) {
    throw new BadRequestError("You are already registered for this activity");
  }

  if (
    activity.registrationDeadline &&
    new Date() > new Date(activity.registrationDeadline)
  ) {
    throw new BadRequestError("Registration deadline has passed");
  }

  if (
    activity.maxParticipants &&
    activity.activityParticipations.length >= activity.maxParticipants
  ) {
    throw new BadRequestError(
      "Activity has reached maximum participant limit"
    );
  }

  const participation = await prisma.activityParticipation.create({
    data: {
      userId: normalizedUserId,
      activityId: activity.id,
      status,
      guestName,
      guestEmail: participantEmail,
      guestPhoneNumber: guestPhoneNumber || null,
    },
  });

  if (participantEmail && activity.organizerId && activity.googleCalendarEventId) {
    await addGuestToCalendarEvent(
      activity.organizerId,
      activity.googleCalendarEventId,
      participantEmail,
    ).catch((err) =>
      console.warn(
        `[Participation] Failed to add guest ${participantEmail} to calendar event:`,
        err.message,
      ),
    );
  }

  if (participantEmail && participantName) {
    await sendEventRegistrationConfirmationEmail(
      participantEmail,
      participantName,
      activity.title,
    ).catch((err) =>
      console.warn(
        `[Participation] Failed to send confirmation email to ${participantEmail}:`,
        err.message,
      ),
    );
  }

  return participation;
};