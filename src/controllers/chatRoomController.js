import {
    createChatRoomService,
    getChatRoomsService,
    getChatRoomByIdService,
    getChatRoomByUserIdService,
    updateChatRoomService,
    softDeleteChatRoomService,
    hardDeleteChatRoomService,
    getChatRoomMembersService,
    addMemberToChatRoomService,
    removeMemberFromChatRoomService,
} from "../services/chatRoomService.js";

const handleError = (res, err, context) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error(`Unexpected error in ${context}:`, err);
    res.status(500).json({ success: false, message: `Internal server error / ${context} error: ${err.message}` });
}

export const createChatRoom = async (req, res) => {
    try {
        const chatRoomData = req.body;
        const newChatRoom = await createChatRoomService(chatRoomData);
        res.status(201).json({
            success: true,
            message: "Chat room created successfully",
            data: newChatRoom
        });
    } catch (err) {
        handleError(res, err, "createChatRoom");
    }
}

export const getChatRooms = async (req, res) => {
    try {
        const chatRooms = await getChatRoomsService();
        res.status(200).json({
            success: true,
            message: "Chat rooms retrieved successfully",
            data: chatRooms
        });
    } catch (err) {
        handleError(res, err, "getChatRooms");
    }
}

export const getChatRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const chatRoom = await getChatRoomByIdService(id);
        res.status(200).json({
            success: true,
            message: "Chat room retrieved successfully",
            data: chatRoom
        });
    } catch (err) {
        handleError(res, err, "getChatRoomById");
    }
}

export const getChatRoomByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const chatRooms = await getChatRoomByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Chat rooms retrieved successfully",
            data: chatRooms
        });
    } catch (err) {
        handleError(res, err, "getChatRoomByUserId");
    }
}

export const updateChatRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const chatRoomData = req.body;
        const updatedChatRoom = await updateChatRoomService(id, chatRoomData);
        res.status(200).json({
            success: true,
            message: "Chat room updated successfully",
            data: updatedChatRoom
        });
    } catch (err) {
        handleError(res, err, "updateChatRoom");
    }
}

export const softDeleteChatRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedChatRoom = await softDeleteChatRoomService(id);
        res.status(200).json({
            success: true,
            message: "Chat room soft deleted successfully",
            data: deletedChatRoom
        });
    } catch (err) {
        handleError(res, err, "softDeleteChatRoom");
    }
}

export const hardDeleteChatRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedChatRoom = await hardDeleteChatRoomService(id);
        res.status(200).json({
            success: true,
            message: "Chat room hard deleted successfully",
            data: deletedChatRoom
        });
    } catch (err) {
        handleError(res, err, "hardDeleteChatRoom");
    }
}

export const getChatRoomMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await getChatRoomMembersService(id);
        res.status(200).json({
            success: true,
            message: "Chat room members retrieved successfully",
            data: members
        });
    } catch (err) {
        handleError(res, err, "getChatRoomMembers");
    }
}

export const addMemberToChatRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const addedMember = await addMemberToChatRoomService(id, Number(userId));
        res.status(201).json({
            success: true,
            message: "Member added to chat room successfully",
            data: addedMember
        });
    } catch (err) {
        handleError(res, err, "addMemberToChatRoom");
    }
}

export const removeMemberFromChatRoom = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const removedMember = await removeMemberFromChatRoomService(id, Number(userId));
        res.status(200).json({
            success: true,
            message: "Member removed from chat room successfully",
            data: removedMember
        });
    } catch (err) {
        handleError(res, err, "removeMemberFromChatRoom");
    }
}