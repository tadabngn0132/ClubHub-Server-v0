import {
    createMessageService,
    getMessagesByChatRoomIdService,
    updateMessageService,
    softDeleteMessageService,
    hardDeleteMessageService
} from '../services/messageService.js';

const handleError = (res, err, context) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error(`Unexpected error in ${context}:`, err);
    res.status(500).json({ success: false, message: `Internal server error / ${context} error: ${err.message}` });
}

export const createMessage = async (req, res) => {
    try {
        const messageData = req.body;

        const newMessage = await createMessageService(messageData);
        res.status(201).json({
            success: true,
            message: "Message created successfully",
            data: newMessage
        });
    } catch (error) {
        handleError(res, error, "createMessage");
    }
}

export const getMessagesByChatRoomId = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const requesterId = req.user.id;

        const messages = await getMessagesByChatRoomIdService(chatRoomId, requesterId);
        res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages
        });
    } catch (error) {
        handleError(res, error, "getMessagesByChatRoomId");
    }
}

export const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const messageData = req.body;
        const requesterId = req.user.id;

        const updatedMessage = await updateMessageService(messageId, messageData, requesterId);
        res.status(200).json({
            success: true,
            message: "Message updated successfully",
            data: updatedMessage
        });
    } catch (error) {
        handleError(res, error, "updateMessage");
    }
}

export const softDeleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const requesterId = req.user.id;

        const deletedMessage = await softDeleteMessageService(messageId, requesterId);
        res.status(200).json({
            success: true,
            message: "Message soft deleted successfully",
            data: deletedMessage
        });
    } catch (error) {
        handleError(res, error, "softDeleteMessage");
    }
}

export const hardDeleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const requesterId = req.user.id;

        const hardDeletedMessage = await hardDeleteMessageService(messageId, requesterId);
        res.status(200).json({
            success: true,
            message: "Message hard deleted successfully",
            data: hardDeletedMessage
        });
    } catch (error) {
        handleError(res, error, "hardDeleteMessage");
    }
}