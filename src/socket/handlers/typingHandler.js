import { checkUserMembershipInChatRoomService } from "../../services/chatRoomService.js";
import { SOCKET_EVENTS } from "../../utils/constants.js";

export const setupTypingHandler = (io, socket) => {
    /**
     * Listen for user:typing
     * -> Validate
     * -> Check membership
     * -> Emit to room + receiver
     * 
     * Listen for user:stop-typing
     * -> Validate
     * -> Check membership
     * -> Emit to room + receiver
    */

    socket.on(SOCKET_EVENTS.USER_TYPING, async (data = {}, ack) => {
        const senderId = Number(socket.data.userId);
        const { chatRoomId } = data;
        if (!chatRoomId) {
            const response = { success: false, message: "Chat room ID is required" };
            safeAck(ack, response);
            return;
        }
        try {
            const isMember = await checkUserMembershipInChatRoomService(chatRoomId, senderId);
            if (!isMember) {
                const response = { success: false, message: "User is not a member of the chat room" };
                safeAck(ack, response);
                return;
            }
            io.to(`room_${chatRoomId}`).emit(SOCKET_EVENTS.USER_TYPING, { userId: senderId, chatRoomId });
            safeAck(ack, { success: true, message: "Typing status sent" });
        } catch (error) {
            console.error("Error handling user:typing:", error);
            safeAck(ack, { success: false, message: error.message || "Failed to send typing status" });
        }
    });

    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, async (data = {}, ack) => {
        const senderId = Number(socket.data.userId);
        const { chatRoomId } = data;

        if (!chatRoomId) {
            const response = { success: false, message: "Chat room ID is required" };
            safeAck(ack, response);
            return;
        }

        try {
            const isMember = await checkUserMembershipInChatRoomService(chatRoomId, senderId);
            if (!isMember) {
                const response = { success: false, message: "User is not a member of the chat room" };
                safeAck(ack, response);
                return;
            }
            io.to(`room_${chatRoomId}`).emit(SOCKET_EVENTS.USER_STOP_TYPING, { userId: senderId, chatRoomId });
            safeAck(ack, { success: true, message: "Stop typing status sent" });
        } catch (error) {
            console.error("Error handling user:stop-typing:", error);
            safeAck(ack, { success: false, message: error.message || "Failed to send stop typing status" });
        }
    });
}