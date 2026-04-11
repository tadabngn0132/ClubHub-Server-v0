import { prisma } from "../libs/prisma.js";
import { SOCKET_EVENTS } from "../utils/constant.js";
import { checkUserMembershipInChatRoomService } from "./chatRoomService.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/AppError.js";
import { emitToChatRoom } from "../socket/socketGateway.js";

const messageInclude = {
  sender: {
    select: {
      id: true,
      fullname: true,
      avatarUrl: true,
    },
  },
};

export const createMessageService = async (messageData) => {
  const { chatRoomId, senderId, content } = messageData;

  if (!content || content.trim() === "") {
    throw new BadRequestError("Message content cannot be empty");
  }

  // Check if the user is a member of the chat room
  const isMember = await checkUserMembershipInChatRoomService(
    chatRoomId,
    senderId,
  );
  if (!isMember) {
    throw new ForbiddenError("User is not a member of the chat room");
  }

  const newMessage = await prisma.message.create({
    data: {
      roomId: chatRoomId,
      senderId,
      content,
    },
    include: messageInclude,
  });

  // Emit the new message to all members of the chat room
  emitToChatRoom(chatRoomId, SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, {
    message: newMessage,
  });

  return newMessage;
};

export const getMessagesByChatRoomIdService = async (
  chatRoomId,
  requesterId,
) => {
  const isMember = await checkUserMembershipInChatRoomService(
    chatRoomId,
    requesterId,
  );
  if (!isMember) {
    throw new ForbiddenError("You are not a member of this chat room");
  }

  const messages = await prisma.message.findMany({
    where: { roomId: chatRoomId, isDeleted: false },
    include: messageInclude,
    orderBy: { createdAt: "asc" },
  });

  return messages;
};

export const updateMessageService = async (
  messageId,
  messageData,
  requesterId,
) => {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId), isDeleted: false },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Check if the requester is the sender of the message
  if (message.senderId !== requesterId) {
    throw new ForbiddenError("You are not the owner of this message");
  }

  const updatedMessage = await prisma.message.update({
    where: { id: Number(messageId) },
    data: { content: messageData.content },
    include: messageInclude,
  });

  // Emit the updated message to all members of the chat room
  emitToChatRoom(updatedMessage.roomId, SOCKET_EVENTS.CHAT_MESSAGE_UPDATE, {
    message: updatedMessage,
  });

  return updatedMessage;
};

export const softDeleteMessageService = async (messageId, requesterId) => {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId), isDeleted: false },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Check if the requester is the sender of the message
  if (message.senderId !== requesterId) {
    throw new ForbiddenError("You are not the owner of this message");
  }

  const deletedMessage = await prisma.message.update({
    where: { id: Number(messageId) },
    data: { isDeleted: true },
  });

  // Emit the soft-deleted message to all members of the chat room
  emitToChatRoom(
    deletedMessage.roomId,
    SOCKET_EVENTS.CHAT_MESSAGE_SOFT_DELETE,
    {
      message: deletedMessage,
    },
  );

  return deletedMessage;
};

export const hardDeleteMessageService = async (messageId, requesterId) => {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId), isDeleted: false },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Check if the requester is the sender of the message
  if (message.senderId !== requesterId) {
    throw new ForbiddenError("You are not the owner of this message");
  }

  const hardDeletedMessage = await prisma.message.delete({
    where: { id: Number(messageId) },
  });

  return hardDeletedMessage;
};
