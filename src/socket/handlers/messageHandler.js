import { SOCKET_EVENTS } from "../../utils/constant.js";
import {
    createMessageService,
    updateMessageService,
    softDeleteMessageService
} from "../../services/messageService.js";

const safeAck = (ack, response) => {
    if (typeof ack === "function") {
        ack(response);
    }
}

export const setupMessageHandler = (io, socket) => {
    /**
     * Listen for message:send
     * -> Validate
     * -> Check membership
     * -> Save to DB
     * -> Emit to room + receiver
     * 
     * Listen for message:update
     * -> Check ownership
     * -> Update in DB
     * -> Emit to room
     * 
     * Listen for message:delete
     * -> Check ownership
     * -> Soft delete in DB
     * -> Emit to room
    */

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_SEND, async (data = {}, ack) => {
        const senderId = Number(socket.data.userId);
        const { chatRoomId, content } = data;

        if (!chatRoomId || !content?.trim()) {
            const response = { success: false, message: "Chat room ID and content are required" };
            safeAck(ack, response);
            return;
        }

        try {
            const newMessage = await createMessageService({ chatRoomId, senderId, content });
            io.to(`room_${chatRoomId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, newMessage);
            safeAck(ack, { success: true, message: "Message sent successfully", data: newMessage });
        } catch (error) {
            console.error("Error sending message:", error);
            safeAck(ack, { success: false, message: error.message || "Failed to send message" });
        }
    });

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_UPDATE, async (data = {}, ack) => {
        const requesterId = Number(socket.data.userId);
        const { messageId, content } = data;

        if (!messageId || !content?.trim()) {
            const response = { success: false, message: "Message ID and new content are required" };
            safeAck(ack, response);
            return;
        }

        try {
            const updatedMessage = await updateMessageService(messageId, { content }, requesterId);
            io.to(`room_${updatedMessage.roomId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE_UPDATE, updatedMessage);
            safeAck(ack, { success: true, message: "Message updated successfully", data: updatedMessage });
        } catch (error) {
            console.error("Error updating message:", error);
            safeAck(ack, { success: false, message: error.message || "Failed to update message" });
        }
    });

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_SOFT_DELETE, async (data = {}, ack) => {
        const requesterId = Number(socket.data.userId);
        const { messageId } = data;

        if (!messageId) {
            const response = { success: false, message: "Message ID is required" };
            safeAck(ack, response);
            return;
        }

        try {
            const deletedMessage = await softDeleteMessageService(messageId, requesterId);
            safeAck(ack, { success: true, message: "Message deleted successfully", data: deletedMessage });
            io.to(`room_${deletedMessage.roomId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE_SOFT_DELETE, deletedMessage);
        } catch (error) {
            console.error("Error deleting message:", error);
            safeAck(ack, { success: false, message: error.message || "Failed to delete message" });
        }
    });
}