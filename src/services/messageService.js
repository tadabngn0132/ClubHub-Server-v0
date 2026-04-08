import { prisma } from "../libs/prisma.js";

const DOMAIN_ERRORS = new Set([
  "Message not found",
  "Unauthorized to edit this message",
  "Unauthorized to delete this message",
]);

const rethrowOrWrap = (error, fallbackMessage) => {
  if (DOMAIN_ERRORS.has(error.message)) {
    throw error;
  }
  throw new Error(fallbackMessage);
};

export const createNewMessageService = async (
  roomId,
  receiverId,
  content,
  senderId,
) => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        roomId,
        senderId,
        receiverId,
        content,
      },
    });

    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    rethrowOrWrap(error, "Failed to send message");
  }
};

export const updateMessageService = async (messageId, content, userId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: Number(messageId) },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to edit this message");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: Number(messageId) },
      data: { content },
    });

    return updatedMessage;
  } catch (error) {
    console.error("Error updating message:", error);
    rethrowOrWrap(error, "Failed to update message");
  }
};

export const getAllMessagesByRoomIdService = async (roomId, userId) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        roomId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "asc" },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
};

export const softDeleteMessageService = async (messageId, userId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: Number(messageId) },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    const deletedMessage = await prisma.message.update({
      where: { id: Number(messageId) },
      data: { isDeleted: true },
    });

    return deletedMessage;
  } catch (error) {
    console.error("Error soft deleting message:", error);
    rethrowOrWrap(error, "Failed to delete message");
  }
};

export const hardDeleteMessageService = async (messageId, userId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: Number(messageId) },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    await prisma.message.delete({
      where: { id: Number(messageId) },
    });

    return { success: true, message: "Message deleted successfully" };
  } catch (error) {
    console.error("Error deleting message:", error);
    rethrowOrWrap(error, "Failed to delete message");
  }
};
