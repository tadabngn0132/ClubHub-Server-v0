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

const handleError = (next, err) => next(err);

export const createChatRoom = async (req, res, next) => {
  try {
    const chatRoomData = req.body;
    const newChatRoom = await createChatRoomService(chatRoomData);
    res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      data: newChatRoom,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const getChatRooms = async (req, res, next) => {
  try {
    const chatRooms = await getChatRoomsService(req.userRole);
    res.status(200).json({
      success: true,
      message: "Chat rooms retrieved successfully",
      data: chatRooms,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const getChatRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatRoom = await getChatRoomByIdService(id, req.userRole);
    res.status(200).json({
      success: true,
      message: "Chat room retrieved successfully",
      data: chatRoom,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const getChatRoomByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const chatRooms = await getChatRoomByUserIdService(
      Number(userId),
      req.userRole,
    );
    res.status(200).json({
      success: true,
      message: "Chat rooms retrieved successfully",
      data: chatRooms,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const updateChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatRoomData = req.body;
    const updatedChatRoom = await updateChatRoomService(id, chatRoomData);
    res.status(200).json({
      success: true,
      message: "Chat room updated successfully",
      data: updatedChatRoom,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const softDeleteChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedChatRoom = await softDeleteChatRoomService(id);
    res.status(200).json({
      success: true,
      message: "Chat room soft deleted successfully",
      data: deletedChatRoom,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const hardDeleteChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedChatRoom = await hardDeleteChatRoomService(id);
    res.status(200).json({
      success: true,
      message: "Chat room hard deleted successfully",
      data: deletedChatRoom,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const getChatRoomMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const members = await getChatRoomMembersService(id);
    res.status(200).json({
      success: true,
      message: "Chat room members retrieved successfully",
      data: members,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const addMemberToChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const addedMembers = await addMemberToChatRoomService(id, userIds);
    res.status(201).json({
      success: true,
      message: "Members added to chat room successfully",
      data: addedMembers,
    });
  } catch (err) {
    handleError(next, err);
  }
};

export const removeMemberFromChatRoom = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const removedMember = await removeMemberFromChatRoomService(
      id,
      Number(userId),
    );
    res.status(200).json({
      success: true,
      message: "Member removed from chat room successfully",
      data: removedMember,
    });
  } catch (err) {
    handleError(next, err);
  }
};
